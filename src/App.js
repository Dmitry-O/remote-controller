import './App.css';
import React from 'react';
import { FaPowerOff, FaWindowClose, FaExclamationCircle } from 'react-icons/fa';
import {Button, Modal, Input, Label, Form, Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import styles from './shared/styles';
import baseUrl from './shared/baseUrl';
import { postController, getController, putController } from './shared/API';

let controllers = localStorage.getItem('controllers') ? JSON.parse(localStorage.controllers) : [];
let countRelays = 1;

const RenderControllers = ({aController}) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const toggle = () => setDropdownOpen(prevState => !prevState);
    let relayArr = [];
    

    for(let i of aController.relays) {
        relayArr.push(i);
    }

    let controller = aController;

    const relays = controller.relays ? controller.relays.map((el, index, arr) => 
        <DropdownItem onClick={async () => {
                arr[index] = !el;
                relayArr[index] = !el;
                controller = await putController(baseUrl + 'controllers', {"serial": controller.serial, "password": controller.password, "relays": relayArr});
                controllers.forEach((el, index, arr) => {
                    console.log(el.serial);
                    if (controller.serial === el.serial) {
                        arr[index] = controller;
                        localStorage.controllers = JSON.stringify(controllers);
                    }
                })
            }} key={index}
        >
            Switch {index+1} {el ? <FaPowerOff color="red"/> : <FaPowerOff/>}
        </DropdownItem>) : [];

    return (
        <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}} className="mb-1">
            <Dropdown isOpen={dropdownOpen} toggle={toggle} key={controller._id}>
                <DropdownToggle caret>
                    {controller.serial}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem header>Перемикачі</DropdownItem>
                    {relays}
                </DropdownMenu>
            </Dropdown>
            <FaWindowClose onClick={() => controllers.forEach((el, index, arr) => {
                if (el.serial === controller.serial) {
                    arr.splice(arr[index], 1);
                    localStorage.controllers = JSON.stringify(controllers);
                    window.location.reload();
                }
            }) } size="30px" className="mt-1" style={{marginLeft: "5px", cursor: "pointer"}}/>
        </div>
    );
};

export default function App() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [controllerInfo, setControllerInfo] = React.useState({serial: '', password: '', relays: []});

  let rControllers = controllers[0] ? controllers.map(el => <RenderControllers aController={el}/>) : null;

  let inputPlus = {};
  for (let i in styles.input)
    inputPlus[i] = styles.input[i];
  
  inputPlus.width = "15%";
  inputPlus.marginLeft = "0px";

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
              <div className="row">
                  <h6 className="col-8 mt-4 text-center">
                    Кількість перемикачів
                  </h6>    
                <Input
                    type="number" min="1" max="8" defaultValue="1" className="col-1"
                    onChange={e => countRelays = e.target.value}
                    style={inputPlus} 
                    placeholder="Кількість перемикачів"
                />
              </div>
              <p className="text-center"><FaExclamationCircle color="red"/> Вкажіть кількість, якщо підключаєте контролер вперше</p>
              <Button
                  onClick={
                    async () => {
                        if (!controllers.some(el => el.serial === controllerInfo.serial)) {
                            let relays = [];
                            for (let i = 0; i < countRelays; i++)
                                relays.push(false);
                            let result = await postController(baseUrl + 'controllers', {"serial": controllerInfo.serial, "password": controllerInfo.password, "relays": relays});
                            controllers.push({serial: result.serial, password: result.password, relays: result.relays});
                            //console.log("result: ", result, " controllers: ", controllers);
                            localStorage.controllers = JSON.stringify(controllers);
                        } else {
                            alert("Такий контроллер вже існує");
                        }
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
                    rControllers ? rControllers
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
