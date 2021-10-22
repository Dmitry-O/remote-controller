import './App.css';
import React from 'react';
import {Button, Modal, Input, Label, Form, Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import styles from './shared/styles';
import baseUrl from './shared/baseUrl';
import { postController, getController } from './shared/API';

let controllers = JSON.parse(localStorage.controllers) ? JSON.parse(localStorage.controllers) : [];
let countRelays = 1;

const RenderControllers = ({controller}) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const toggle = () => setDropdownOpen(prevState => !prevState);

    console.log(controller);
    const relays = controller.relays ? controller.relays.map((el, index, arr) => <DropdownItem onClick={(e) => arr[index] = !el} key={index}>Перемикач {index+1} {el ? 'on' : 'off'}</DropdownItem>) : [];

    return (
        <Dropdown isOpen={dropdownOpen} toggle={toggle} key={controller._id}>
            <DropdownToggle caret>
                {controller.serial}
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem header>Перемикачі</DropdownItem>
                {relays}
            </DropdownMenu>
        </Dropdown>
    );
}

export default function App() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [controllerInfo, setControllerInfo] = React.useState({serial: '', password: '', relays: []});

  let rControllers = controllers.map(el => <RenderControllers controller={el}/>);

  return (
      <>
        <Modal className="container" isOpen={modalVisible} toggle={() => setModalVisible(!modalVisible)}>
            <h4 className="text-center mt-2 text-secondary">Додайте мікроконтролер</h4>
              <Input
                  type="text"
                  onChange={e => setControllerInfo({serial: e.target.value, password: controllerInfo.password, relays: controllerInfo.relays})}
                  style={styles.input}
                  placeholder="Серійний номер"
              />
              <Input
                  type="password"
                  onChange={e => setControllerInfo({serial: controllerInfo.serial, password: e.target.value, relays: controllerInfo.relays})}
                  style={styles.input}
                  placeholder="Пароль"
              />
              <Input
                  type="number" min="1" max="8"
                  onChange={e => countRelays = e.target.value}
                  style={styles.input}
                  placeholder="Кількість перемикачів"
              />
              <Button
                  onClick={
                    async () => {
                      let relays = [];
                      for (let i = 0; i < countRelays; i++)
                          relays.push(false);
                      let result = await postController(baseUrl + 'controllers', {"serial": controllerInfo.serial, "password": controllerInfo.password, "relays": relays});
                      controllers.push({serial: result.serial, password: result.password, relays: result.relays});
                        console.log("result: ", result, " controllers: ", controllers);
                        localStorage.controllers = JSON.stringify(controllers);
                      setModalVisible(!modalVisible);
                    }}
                  color="warning"
                  className="mb-2"
                  style={{width: "40%", marginLeft: "auto", marginRight: "auto"}}
              >
                Додати контролер
              </Button>

        </Modal>
        <div className="container text-center" style={{marginTop: "20%"}}>
            <div>
                {
                    rControllers.length > 0 ?
                    rControllers
                    : 'Поки що немає контролерів'
                }

            </div>
            <Button
                style={{margin: 10, backgroundColor: "#ffc400", width: 50, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 5}}
                onClick={() => setModalVisible(true)}
            >
                +
            </Button>
        </div>
      </>
  );
}
