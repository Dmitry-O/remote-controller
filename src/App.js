import './App.css';
import React from 'react';
import { FaPowerOff, FaWindowClose, FaExclamationCircle, FaPlus, FaEdit, FaCheckCircle, FaLuggageCart } from 'react-icons/fa';
import {Button, Modal, Input, Label, Form, Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import styles from './shared/styles';
import baseUrl from './shared/baseUrl';
import { postController, putController } from './shared/API';

const PREFIX = "RMC";
const SUFIX = "SE";

let controllers = localStorage.getItem('controllers') ? JSON.parse(localStorage.controllers) : [];
let names = localStorage.getItem('names') ? JSON.parse(localStorage.names) : [];
let countRelays = 1;

const RenderControllers = ({aController}) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [modeModalVisible, setModeModalVisible] = React.useState({visible: false, relay: {el: null, index: null, arr: null}});
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const [isChanged, setIsChanged] = React.useState(false);
    const [hideTools, setHideTools] = React.useState(false);
    const [workingMode, setWorkingMode] = React.useState("simple");

    const [countTimer, setCountTimer] = React.useState(0);
    const [turnOn, setTurnOn] = React.useState(false);
    const [hideTimer, setHideTimer] = React.useState(false);
    const [disableButton, setDisableButton] = React.useState(false);
    const [stopButton, setStopButton] = React.useState(true);

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
        <div className="col-6 col-md-3">
            <DropdownItem onClick={() => {
                    setModeModalVisible({visible: !modeModalVisible.visible, relay: {el, index, arr}});

                    // arr[index] = !el;
                    // relayArr[index] = !el;
                    // controller = await putController(baseUrl + 'controllers', {"serial": controller.serial, "password": controller.password, "relays": relayArr});
                    // controllers.forEach((el, index, arr) => {
                    //     console.log(el.serial);
                    //     if (controller.serial === el.serial) {
                    //         arr[index] = controller;
                    //         localStorage.controllers = JSON.stringify(controllers);
                    //     }
                    // })
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
                <div className="col-9">
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
                <div className="col-3">
                    <div style={{width: "60%"}} hidden={!hideTools}>
                        <p style={{fontSize: "10pt"}}>Видалити цей контролер?</p>
                        <div style={{marginTop: "-15px"}}>
                            <Button size="sm" color="danger"
                                onClick={() => controllers.forEach((el, index, arr) => {
                                    if (el.serial === controller.serial) {
                                        arr.splice(arr[index], 1);
                                        localStorage.controllers = JSON.stringify(controllers);
                                        window.location.reload();
                                    }
                                })}
                            >
                                Так
                            </Button>
                            <Button onClick={() => setHideTools(!hideTools)} style={{marginLeft: "10%"}} size="sm" color="success">Ні</Button>
                        </div>
                    </div>
                    <div hidden={hideTools}>
                        <FaEdit onClick={() => setModalVisible(!modalVisible)} style={{cursor: "pointer"}} size="30px" />
                        <FaWindowClose onClick={() => setHideTools(!hideTools)} size="30px" className="mt-1" style={{marginLeft: "5px", cursor: "pointer"}}/>
                    </div>
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
                  onClick={() => setModalVisible(!modalVisible)}
              >
                OK
              </Button>
              {
                  isChanged === true ?
                    <span className="text-center"><FaCheckCircle color="green"/> Зміни зберігаються автоматично</span>
                  : null
              }
            </Modal>



            {/* Modal for setting working mode */}
            <Modal className="container" isOpen={modeModalVisible.visible} toggle={() => setModeModalVisible({visible: !modeModalVisible.visible, relay: modeModalVisible.relay})}
                onClosed={() => setWorkingMode("simple")}
            >
                <div style={{margin: "10px"}}>
                    <h4 className="text-center mt-2 text-secondary">Вибір режиму роботи мікроконтролеру</h4>
                    
                    <select className="form-select" aria-label="Default select example"
                        onChange={(e) => {
                            let mode = e.target.value;
                            setWorkingMode(mode);
                        }}
                    >
                        <option selected value="simple">Простий режим (вкл/вимк)</option>
                        <option value="timer">Таймер</option>
                        <option value="period">Період</option>
                        <option value="regime">Графік</option>
                    </select>

                    <div className="mt-4">
                        <RenderModeSection mode={workingMode} controller={controller} relay={modeModalVisible.relay} relayArr={relayArr}
                            _countTimer={{countTimer, setCountTimer}} _disableButton={{disableButton, setDisableButton}}
                            _hideTimer={{hideTimer, setHideTimer}} _stopButton = {{stopButton, setStopButton}} _turnOn={{turnOn, setTurnOn}}
                        />
                    </div>

                    <Button
                        color="warning"
                        className="mb-2 mt-2"
                        style={{width: "20%", marginLeft: "auto", marginRight: "auto"}}
                        onClick={() => setModeModalVisible({visible: !modeModalVisible.visible, relay: modeModalVisible.relay})}
                    >
                        Закрити
                    </Button>
                </div>
            </Modal>
        </>
    );
};

async function changeRelayState(controller, relay, relayArr) {
    let {el, index, arr} = relay;

    arr[index] = !el;
    relayArr[index] = !el;
    controller = await putController(baseUrl + 'controllers', {"serial": controller.serial, "password": controller.password, "relays": relayArr});
    controllers.forEach((el, index, arr) => {
        console.log(el.serial);
        if (controller.serial === el.serial) {
            arr[index] = controller;
            localStorage.controllers = JSON.stringify(controllers);
        }
    });
}

function parseMillisecondsIntoTime(milliseconds) {
    //Get hours from milliseconds
    var hours = milliseconds / (1000*60*60);
    var absoluteHours = Math.floor(hours);
    var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;
  
    //Get remainder from hours and convert to minutes
    var minutes = (hours - absoluteHours) * 60;
    var absoluteMinutes = Math.floor(minutes);
    var m = absoluteMinutes > 9 ? absoluteMinutes : '0' +  absoluteMinutes;
  
    //Get remainder from minutes and convert to seconds
    var seconds = (minutes - absoluteMinutes) * 60;
    var absoluteSeconds = Math.floor(seconds);
    var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;
  
    return h + ':' + m + ':' + s;
}

let idRegInt;

const StartSection = ({onClickHandler, disableButton, el, _turnOn, hideStartBtn, relayData}) => {
    let {turnOn, setTurnOn} = _turnOn;
    let controller, relay, relayArr;
    if (hideStartBtn) {
        controller = relayData.controller;
        relay = relayData.relay;
        relayArr = relayData.relayArr;
    }

    return (
        <div className="row">
            <div className="col-1"></div>
            <div className="form-check form-switch col-6">
                <Input className="form-check-input" type="checkbox" role="switch" id="switch" disabled={disableButton} checked={turnOn}
                    onChange={(e) => {
                        if (hideStartBtn) {
                            changeRelayState(controller, relay, relayArr);
                        }
                        setTurnOn(e.target.checked);
                    }}
                />
                <Label className="form-check-label" htmlFor="switch">Вкл/вимк пристрій</Label>
            </div>
            {
                !hideStartBtn ?
                    <Button disabled={disableButton} color="success" className="w-25" onClick={onClickHandler}>Start</Button>
                :   null
            }
        </div>
    );
}

const days = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
const choosedDays = localStorage.getItem('choosedDays') ? JSON.parse(localStorage.choosedDays) : [];

function daysForRegimeMode(toggle) {
    return days.map((el, index) =>
        <DropdownItem className={choosedDays.includes(el) ? "text-primary" : "text-dark"} id={"list-" + index} onClick={(e) => {
            toggle();
            let element = document.getElementById("list-" + index);

            if (element.classList.contains("text-dark")) {
                element.classList.replace("text-dark", "text-primary");
                choosedDays.push(el);
            } else {
                element.classList.replace("text-primary", "text-dark");
                choosedDays.splice(choosedDays.indexOf(el), 1);
            }
        }}>
            {el}
        </DropdownItem>
    );
}

function getCurrentDateTime(addMinutes) {
    let now = new Date();
    let temp = now.getFullYear() + '-' + (now.getMonth()+1 < 10 ? '0' + (now.getMonth()+1) : (now.getMonth()+1)) + '-' + now.getDate() + 'T' + now.getHours() + ':' + (now.getMinutes() + addMinutes);
    console.log(temp);
    console.log(now);
    return temp;
}

const RenderModeSection = ({mode, controller, relay, relayArr, _countTimer, _disableButton, _hideTimer, _stopButton, _turnOn}) => {
    let {el} = relay;
    let {countTimer, setCountTimer} = _countTimer;
    let {disableButton, setDisableButton} = _disableButton;
    let {hideTimer, setHideTimer} = _hideTimer;
    let {turnOn, setTurnOn} = _turnOn;
    let {stopButton, setStopButton} = _stopButton;

    React.useEffect(() => {
        setTurnOn(el);
        console.log("el was set: ", el);
    }, []);

    const [timer, setTimer] = React.useState(0);
    const [listOpen, setListOpen] = React.useState(false);

    console.log("start", localStorage.regimeTimeStart);

    const [startTime, setStartTime] = React.useState(localStorage.regimeTimeStart ? localStorage.regimeTimeStart : "00:00");
    const [endTime, setEndTime] = React.useState(localStorage.regimeTimeEnd ? localStorage.regimeTimeEnd : "00:00");

    const toggle = () => setListOpen(prevState => !prevState);

    const [period, setPeriod] = React.useState({startDateTime: localStorage.periodStart ? localStorage.periodStart : getCurrentDateTime(0),
                                                endDateTime: localStorage.periodEnd ? localStorage.periodEnd : getCurrentDateTime(10)});

    let workingState;

    function intervalTrigger(setCountTimer) {
        return setInterval(() => {
            let temp;
            setCountTimer(prevState => { temp = prevState - 1000; return prevState - 1000; });
            console.log("time: ", temp)
        }, 1000);
    }

    function regimeIntervalTrigger(startMinutes, endMinutes) {
        workingState = turnOn;
        
        return setInterval(() => {
            let currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();

            // let _switch = document.getElementById("switch");

            if (currentMinutes >= startMinutes && currentMinutes < endMinutes && choosedDays.includes(days[new Date().getDay()])) {
                console.log("In regime mode");
                if (el !== workingState) {
                    changeRelayState(controller, relay, relayArr);
                    el = workingState;
                }
            } else {
                console.log("Not in regime mode");
                if (el === workingState) {
                    changeRelayState(controller, relay, relayArr);
                    el = !workingState;
                }
            }

            console.log(el === workingState);
            // _switch.setAttribute("value", el);
        }, 10000);
    }

    function parseStringTime(type, string) {
        if (type === "hours") return parseInt(string[0] + string[1]);
        if (type === "minutes") return parseInt(string[3] + string[4]);
    }

    function simpleModeHandler() {
        console.log("trunOn: ", turnOn);
        console.log("el: ", el);
        // console.log(el === turnOn);
        if (el !== turnOn) {
            changeRelayState(controller, relay, relayArr);
            // el = relay.el;
            console.log("el after: ", el);
        }
        console.log("relay.el: ", relay.el);

    }

    function timerModeHandler() {
        if (timer > 0) {
            if (el !== turnOn) {
                changeRelayState(controller, relay, relayArr);
            }
            setDisableButton(true);
            setCountTimer(timer);
            setHideTimer(true);

            let id = intervalTrigger(setCountTimer);

            setTimeout(() => {
                changeRelayState(controller, relay, relayArr);
                clearInterval(id);
                setDisableButton(false);
                setHideTimer(false);
                setTurnOn(!turnOn);
            }, timer);
        } else {
            alert("Введіть корректний час");
        }
    }

    function periodModeHandler() {
        setStopButton(!stopButton);
        setDisableButton(!disableButton);

        let _switch = document.getElementById("switch");

        let now = new Date().valueOf(),
            start = new Date(period.startDateTime).valueOf(),
            end = new Date(period.endDateTime).valueOf();

        console.log(turnOn);
        if (stopButton) {
            localStorage.periodStart = period.startDateTime;
            localStorage.periodEnd = period.endDateTime;

            setTimeout(() => {
                if (el !== turnOn) {
                    changeRelayState(controller, relay, relayArr);
                }
            }, start - now < 0 ? 100 : start - now);

            setTimeout(() => {
                changeRelayState(controller, relay, relayArr);
                _switch.setAttribute("checked", false);
            }, end - now);
        } else {
            localStorage.removeItem("periodStart");
            localStorage.removeItem("periodEnd");
        }
    }

    function regimeModeHandler() {
        localStorage.choosedDays = choosedDays.length > 0 ? JSON.stringify(choosedDays) : undefined;
        let startMinutes = parseStringTime("hours", startTime) * 60 + parseStringTime("minutes", startTime);
        let endMinutes = parseStringTime("hours", endTime) * 60 + parseStringTime("minutes", endTime);

        if (!stopButton) {
            clearInterval(idRegInt);
            console.log("Interval ", idRegInt, " cleared");
            localStorage.removeItem("regimeTimeStart");
            localStorage.removeItem("regimeTimeEnd");
        } else {
            idRegInt = regimeIntervalTrigger(startMinutes, endMinutes);
            console.log("we're working, interv: ", idRegInt);

            localStorage.regimeTimeStart = startTime;
            localStorage.regimeTimeEnd = endTime;
        }

        setStopButton(!stopButton);
        setDisableButton(!disableButton);
    }

    switch (mode) {
        case "simple": return (
            <StartSection
                onClickHandler={simpleModeHandler}
                disableButton={disableButton} el={el}
                _turnOn={{turnOn, setTurnOn}} hideStartBtn={true} relayData={{controller, relay, relayArr}}
            />
        );

        case "timer": return (
            <>
                <Input type="time" defaultValue="00:00:00" step="1" hidden={hideTimer} onInput={(e) => {
                    let time = e.target.value;
                    let result = (time[0] + time[1]) * 60 * 60 * 1000 + (time[3] + time[4]) * 60 * 1000 + (time[6] + time[7]) * 1000;
                    setTimer(result);
                }}/>
                <Input type="time" defaultValue="00:00:00" step="1" hidden={!hideTimer} value={parseMillisecondsIntoTime(countTimer)}/>

                <StartSection
                    onClickHandler={timerModeHandler}
                    disableButton={disableButton} el={el}
                    _turnOn={{turnOn, setTurnOn}}
                />
            </>
        );

        case "period": return (
            <>                                                
                <div className="row" style={{padding: "2%"}}>
                    <Input className="w-50" type="datetime-local" min={period.startDateTime} value={period.startDateTime}
                        onChange={e => setPeriod({startDateTime: e.target.value, endDateTime: period.endDateTime})}
                    />
                    <Input className="w-50" type="datetime-local" min={period.endDateTime} value={period.endDateTime}
                        onChange={e => setPeriod({startDateTime: period.startDateTime, endDateTime: e.target.value})}
                    />
                    <StartSection
                        onClickHandler={periodModeHandler}
                        disableButton={disableButton} el={el}
                        _turnOn={{turnOn, setTurnOn}}
                    />
                    <Button className="w-25" color="danger" disabled={stopButton} onClick={periodModeHandler} >
                        Stop
                    </Button>
                    {new Date().valueOf() > new Date(period.startDateTime).valueOf() && new Date().valueOf() < new Date(period.endDateTime).valueOf() ? "true" : "false"}
                </div>
            </>
        );

        case "regime": return (
            <>
                <div className="row">
                    <Dropdown className="w-50" isOpen={listOpen} toggle={toggle} key={el}>
                        <DropdownToggle caret color="warning" style={{width: "100%"}}>        
                            Оберіть дні
                        </DropdownToggle>
                        <DropdownMenu>
                            {daysForRegimeMode(toggle)}
                        </DropdownMenu>
                    </Dropdown>
                    <Input className="w-25" type="time" value={startTime}
                            onChange={(e) => setStartTime(e.target.value)} />
                    <Input className="w-25" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
                {choosedDays.length > 0 ? choosedDays.join(", ") : ""}
                <StartSection
                    onClickHandler={regimeModeHandler}
                    disableButton={disableButton} el={el} _stopButton={_stopButton}
                    _turnOn={{turnOn, setTurnOn}}
                />
                <Button className="w-25" color="danger" disabled={stopButton} onClick={regimeModeHandler} >
                    Stop
                </Button>
                <h5>{typeof workingState !== "undefined" ? workingState ? "Зараз пристрій увімкнений" : "Зараз пристрій вимкнений" : null}</h5>
            </>
        );

        default: return <>Empty...</>
    }
}

export default function App() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [controllerInfo, setControllerInfo] = React.useState({serial: '', password: '', relays: []});

  let rControllers = controllers[0] ? controllers.map(el => <RenderControllers aController={el}/>) : null;

  let inputPlus = {}, serialInput = {};
  for (let i in styles.input) {
    inputPlus[i] = styles.input[i];
    serialInput[i] = styles.input[i];
  }
  
  inputPlus.width = "15%";
  inputPlus.marginLeft = "0px";

  serialInput.width = "40%";
  serialInput.marginLeft = "0px";
  serialInput.marginRight = "0px";

  return (
      <>
        <Modal className="container" isOpen={modalVisible} toggle={() => setModalVisible(!modalVisible)}>
            <h4 className="text-center mt-2 text-secondary">Додайте мікроконтролер</h4>
              <div className="row">
                <div className="col-2"></div>
                <h6 className="mt-4 col-1 text-secondary" style={{marginRight: "3%", marginLeft: "3%"}}>{PREFIX}</h6>
                <Input
                    type="text" min="8" max="8"
                    onChange={e => setControllerInfo({serial: e.target.value, password: controllerInfo.password, relays: controllerInfo.relays})}
                    style={serialInput}
                    placeholder="Серійний номер"
                />
                <h6 className="mt-4 col-2 text-secondary">{SUFIX}</h6>
                <div className="col-2"></div>
              </div>
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
              <div className="row text-center">
                <div className="col-1"></div>
                <Button
                    onClick={
                        async () => {
                            if (controllerInfo.serial.length === 8 && controllerInfo.password.length === 8) {
                                if (!controllers.some(el => el.serial === controllerInfo.serial)) {
                                    let relays = [];
                                    for (let i = 0; i < countRelays; i++)
                                        relays.push(false);
                                    let result = await postController(baseUrl + 'controllers', {"serial": PREFIX + controllerInfo.serial + SUFIX, "password": controllerInfo.password, "relays": relays});
                                    if (result.serial) {
                                        controllers.push({serial: result.serial, password: result.password, relays: result.relays});
                                        localStorage.controllers = JSON.stringify(controllers);
                                        setModalVisible(!modalVisible);
                                    }
                                    else {
                                        alert("Пароль невірний");
                                    }
                                } else {
                                    alert("Такий контроллер вже існує");
                                }
                            } else {
                                alert("Серійний номер або пароль недійсні\nСпробуйте ще раз");
                            }
                        }}
                    color="warning"
                    className="mb-2 col-5"
                >
                    Додати контролер
                </Button>
                <Button
                    onClick={() => setModalVisible(!modalVisible)}
                    color="secondary"
                    className="mb-2 col-4"
                    style={{marginLeft: "5%"}}
                >
                    Скасувати
                </Button>
              </div>
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
                style={{margin: 10, marginLeft: "auto", width: 60, height: 60, alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "3px solid black"}}
                onClick={() => setModalVisible(true)}
            >
                <FaPlus size="lg"/>
            </Button>
        </div>
      </>
  );
}
