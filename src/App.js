import './App.css';
import React from 'react';
import { FaPowerOff, FaWindowClose, FaExclamationCircle, FaPlus, FaEdit } from 'react-icons/fa';
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
        <div className="col-3">
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
                <h5>Switch {index+1} {el ? <FaPowerOff className="text-warning"/> : <FaPowerOff/>} </h5>
            </DropdownItem>
        </div>
    ) : [];

    return (
        <div className="row mb-1">
            <div className="col-11">
                <Dropdown size="lg" className="row" isOpen={dropdownOpen} toggle={toggle} key={controller.serial}>
                    <DropdownToggle caret color="warning" style={{width: "100%"}}>        
                        {controller.serial}
                    </DropdownToggle>
                    <DropdownMenu right className="text-center row">
                        <DropdownItem header><h3 className="text-center">Перемикачі</h3></DropdownItem>
                        <div className="row">{relays}</div>
                    </DropdownMenu>
                </Dropdown>
            </div>
            <div className="col-1">
                <FaEdit size="30px" />
                <FaWindowClose onClick={() => controllers.forEach((el, index, arr) => {
                    if (el.serial === controller.serial) {
                        arr.splice(arr[index], 1);
                        localStorage.controllers = JSON.stringify(controllers);
                        window.location.reload();
                    }
                }) } size="30px" className="mt-1" style={{marginLeft: "5px", cursor: "pointer"}}/>
            </div>
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
        <div className="" style={{marginTop: "0%"}}>
            <div className="bg-dark mb-1" style={{height: "5em"}}>
                <h1 className="text-center text-warning pt-3">Мої мікроконтролери</h1>
            </div>
            <div className="">
                {
                    rControllers ? rControllers
                    : <h1 className="text-center" style={{marginTop: "30%"}}>Поки що немає мікроконтролерів<br/>Додайте новий</h1>
                }

            </div>
            <Button
                className="fixed-bottom"
                color="warning"
                style={{margin: 10, marginLeft: "auto", width: 75, height: 75, alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "3px solid black"}}
                onClick={() => setModalVisible(true)}
            >
                <FaPlus size="lg"/>
            </Button>
        </div>
      </>
  );
}
