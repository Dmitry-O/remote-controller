import './App.css';
import React from 'react';
import { FaPowerOff, FaWindowClose, FaExclamationCircle, FaPlus, FaEdit, FaCheckCircle } from 'react-icons/fa';
import {Button, Modal, Input, Label, Form, Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import styles from './shared/styles';
import baseUrl from './shared/baseUrl';
import { postController, getController, putController } from './shared/API';

// localStorage.removeItem('names');

let controllers = localStorage.getItem('controllers') ? JSON.parse(localStorage.controllers) : [];
let names = localStorage.getItem('names') ? JSON.parse(localStorage.names) : [];
let countRelays = 1;

const RenderControllers = ({aController}) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const [isChanged, setIsChanged] = React.useState(false);

    const toggle = () => setDropdownOpen(prevState => !prevState);
    let relayArr = [];

    for(let i of aController.relays) {
        relayArr.push(i);
    }

    let controller = aController, relayNames = [], serialName = '';

    if(names.length > 0) {
        names.some(el => el.serial === controller.serial) ? names.forEach(el => {
            if(el.serial === controller.serial) {
                for(let i in el.relays)
                    relayNames[i] = el.relays[i];    
                serialName = el.serialName;
            }
        })
        : controller.relays.forEach((el, index) => relayNames[index] = "");
    }

    const [name, setName] = React.useState({serialName, relays: relayNames, serial: controller.serial});

    const inputs = relayArr.map((el, index) => 
        <div className="col-5">
            <div className="row">
                <Input
                    key={name.serial}
                    type="text" maxLength="10"
                    onChange={e => {
                        relayNames[index] = e.target.value;
                        setName({serialName: name.serialName, relays: relayNames, serial: name.serial});
                        setIsChanged(true);
                    }}
                    onBlur={() => {
                            names.some(el => el.serial === name.serial) ? names.forEach(el => {
                                if(el.serial === name.serial) {
                                    for(let i in name.relays)
                                        el.relays[i] = name.relays[i];                  
                                }
                            })
                            : names.push(name);
                            localStorage.names = JSON.stringify(names);
                        }
                    } 
                    style={styles.input}
                    value={name.relays[index] ? name.relays[index] : ""}
                    placeholder={"Switch " + (1 + index)}
                />
                {'(' + (index + 1) + ')'}
            </div>
        </div>
    );

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
                <h5>
                    {
                        relayNames[index] ?
                            <>
                                {relayNames[index]} {el ? <FaPowerOff className="text-warning"/> : <FaPowerOff/>}
                            </>
                        :
                            <>
                                Switch {index+1} {el ? <FaPowerOff className="text-warning"/> : <FaPowerOff/>}
                            </>
                    }
                </h5>
            </DropdownItem>
        </div>
    ) : [];

    return (
        <>
            <div className="row mb-1">
                <div className="col-10">
                    <Dropdown size="lg" className="row" isOpen={dropdownOpen} toggle={toggle} key={controller.serial}>
                        <DropdownToggle caret color="warning" style={{width: "100%"}}>        
                            {
                                serialName ? serialName + ' (' + controller.serial + ')'
                                : controller.serial
                            }
                        </DropdownToggle>
                        <DropdownMenu right className="text-center row">
                            <DropdownItem header><h3 className="text-center">Перемикачі</h3></DropdownItem>
                            <div className="row">{relays}</div>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div className="col-2">
                    <FaEdit onClick={() => setModalVisible(!modalVisible)} style={{cursor: "pointer"}} size="30px" />
                    <FaWindowClose onClick={() => controllers.forEach((el, index, arr) => {
                        if (el.serial === controller.serial) {
                            arr.splice(arr[index], 1);
                            localStorage.controllers = JSON.stringify(controllers);
                            window.location.reload();
                        }
                    }) } size="30px" className="mt-1" style={{marginLeft: "5px", cursor: "pointer"}}/>
                </div>
            </div>
            <Modal className="" isOpen={modalVisible} toggle={() => setModalVisible(!modalVisible)}>
                <h4 className="text-center mt-2 text-secondary">Редагування мікроконтролеру</h4>
                <h4 className="text-center mt-2">Назва</h4>
                <Input
                    type="text"
                    onChange={e => {
                        setName({serialName: e.target.value, relays: name.relays, serial: name.serial});
                        setIsChanged(true);
                    }}
                    onBlur={() => {
                        names.some(el => el.serial === name.serial) ? names.forEach(el => {
                            if(el.serial === name.serial) {
                                el.serialName = name.serialName;                  
                            }
                        })
                        : names.push(name);
                        localStorage.names = JSON.stringify(names);
                    }}
                    style={styles.input}
                    placeholder="Назва мікроконтролеру"
                    value={name.serialName ? name.serialName : ""}
                />
                <h4 className="text-center mt-1">Перемикачі</h4>
                <div className="row" style={{marginLeft: "3em"}}>
                    {inputs}
                </div>
              <Button
                  color="warning"
                  className="mb-2 mt-2"
                  style={{width: "20%", marginLeft: "auto", marginRight: "auto"}}
              >
                OK
              </Button>
              {
                  isChanged === true ?
                    <span className="text-center"><FaCheckCircle color="green"/> Зміни зберігаються автоматично</span>
                  : null
              }
            </Modal>
        </>
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
