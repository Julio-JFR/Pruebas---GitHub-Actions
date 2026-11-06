import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { NgbAlert, NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { Distrito } from "../../distritos/distrito.model";
import { DistritosService } from "../../distritos/distritos.service";
import { Pais } from "../../paises/pais.model";
import { PaisesService } from "../../paises/paises.service";
import { Provincia } from "../../provincias/provincia.model";
import { ProvinciasService } from "../../provincias/provincias.service";
import { Region } from "../../regiones/region.model";
import { RegionesService } from "../../regiones/regiones.service";
import { Cliente } from "../cliente.model";
import { TipoEmpresa } from "../../tipo-empresa/tipo-empresa.model";
import { JuridicoModels } from "../../juridicos/juridico-models";
import { ClienteService } from "../cliente.service";
import { IdiomasService } from "../../idiomas/idiomas.service";
import { TipoEmpresaService } from "../../tipo-empresa/tipo-empresa.service";
import { JuridicoService } from "../../juridicos/juridico.service";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { TIME_OUT_ALERT_SUCCESS } from "src/app/helpers/constantes";
import { ValidacionesService } from "src/app/shared/services/validaciones.service";

@Component({
    selector: "app-cliente-personal-info",
    templateUrl: "./cliente-personal-info.component.html",
    styleUrls: ["./cliente-personal-info.component.scss"],
})
export class ClientePersonalInfoComponent implements OnInit {
    private _success = new Subject<string>();

    staticAlertClosed = false;

    SEXO_CLIENTE = [
        { clave: "M", nombre: "Masculino" },
        { clave: "F", nombre: "Femenino" },
    ];
    clienteForm: any;
    datosJuridicosForm: any;
    maxFecha: string;

    CLIENTE: Cliente = new Cliente();
    ID_CLIENTE: number;

    PAISES: Pais[];
    REGIONES: Region[];
    PROVINCIAS: Provincia[];
    DISTRITOS: Distrito[];
    IDIOMAS: any;
    TIPOEMPRESA: TipoEmpresa = new TipoEmpresa();
    TIPOSEMPRESAS: TipoEmpresa[];
    JURIDICO: JuridicoModels;

    // Users list is loading
    cargandoDatos: boolean;
    cargandoActualizarDatos: boolean;
    cargandoDatosModal: boolean;

    mensajes = "";
    mostrarAlerta = false;
    tipoAlerta = "";

    errorActualizar = "";

    MENSAJE_CONFIRMACION: string;
    TITULO_CONFIRMACION: string;

    tipoEmpresaID: number;

    @ViewChild("modalConfirmacion") elementModalConfirmacion: ElementRef;

    constructor(
        private router: Router,
        private paisesService: PaisesService,
        private regionesService: RegionesService,
        private provinciaService: ProvinciasService,
        private distritoService: DistritosService,
        public modal: NgbModal,
        private formBuilder: FormBuilder,
        private datePipe: DatePipe,
        private validacionesService:ValidacionesService,
        private clienteService: ClienteService,
        private idiomaService: IdiomasService,
        private tipoEmpresaService: TipoEmpresaService,
        private juridicoService: JuridicoService
    ) {}

    ngOnInit(): void {
        this.clienteService.updateHeaders();
        this.inicializarDatosJuridicosForm(); // Inicializo cliente juridico. CLI_TIPO =1
        this.inicializarClienteForm(); // Inicializo cliente natural.CLI_TIPO =0
        this.obtenerCliente();
        this.obtenerFechaMinima();
        
    }

    obtenerCliente(){
        this.validacionesService.quitarValidaciones(this.clienteForm);
        this.validacionesService.quitarValidaciones(this.datosJuridicosForm);
        this.getCliente().then(() => {
            if (this.CLIENTE === undefined) {
                this.goToNotFound();
            } else {
                this.ID_CLIENTE = this.CLIENTE.CLI_ID;
                this.getIdiomas();
                this.getPaises();
                this.getRegiones(this.CLIENTE.PAI_ID);
                this.getProvincias(this.CLIENTE.REG_ID);
                this.getDistritos(this.CLIENTE.PRO_ID);

                if (
                    this.CLIENTE.USU_FECH_NACIMIENTO !==
                    "0000-00-00 00:00:00"
                ) {
                    this.CLIENTE.USU_FECH_NACIMIENTO =
                        this.datePipe.transform(
                            this.CLIENTE.USU_FECH_NACIMIENTO,
                            "yyyy-MM-dd"
                        );
                } else {
                    this.CLIENTE.USU_FECH_NACIMIENTO = "0000-00-00";
                }
                if (this.CLIENTE.CLI_TIPO === 1) {
                    // 1 para juridico y 0 natural

                    this.getTiposEmpresas();

                    this.getTipoEmpresaByCliente(this.CLIENTE.CLI_ID).then(
                        () => {
                            this.getJuridicoByCliente(
                                this.CLIENTE.CLI_ID
                            ).then((d) => {
                                this.cargandoDatos = false;
                                this.datosJuridicosForm.enable();
                                this.updateValuesClientesJuridico();
                            });
                        }
                    );
                } else {
                    this.clienteForm.enable();
                    this.updateValuesClientes();
                    this.cargandoDatos = false;
                }
            }
        })
        .catch(() => {
            this.MENSAJE_CONFIRMACION =
                "Hubo un error al intentar obtener la información personal. Por favor, intente de nuevo";
            this.cargandoDatos = false;
        });
    }

    inicializarAlerta() {
        this._success.subscribe((message) => (this.mensajes = message));
        this._success
            .pipe(debounceTime(TIME_OUT_ALERT_SUCCESS))
            .subscribe(() => {
                this.tipoAlerta = "";
                this.mostrarAlerta = false;
            });
    }

    public changeSuccessMessage() {
        this._success.next(`${new Date()} - Message successfully changed.`);
    }

    inicializarClienteForm() {
        this.clienteForm = this.formBuilder.group({
            usu_nombres: [
                { value: "", disabled: true }
             
            ],
            usu_dni: [
                { value: "", disabled: true }
               
            ],
            usu_ape_pat: [
                { value: "", disabled: true }
            ],
            usu_ape_mat: [
                { value: "", disabled: true }
            ],
            usu_sexo: [{ value: "", disabled: true }],
            idi_id: [{ value: "", disabled: true }],
            pai_id: [{ value: "", disabled: true }],
            reg_id: [{ value: "", disabled: true }],
            pro_id: [{ value: "", disabled: true }],
            dist_id: [{ value: "", disabled: true }],
            usu_direccion: [
                { value: "", disabled: true }
            ],
            usu_celular: [
                { value: "", disabled: true }
            ],
            usu_fech_nacimiento: [
                { value: "", disabled: true }
            ],
        });
    }

    inicializarDatosJuridicosForm() {
        this.datosJuridicosForm = this.formBuilder.group({
            jur_usu_nombres: [
                { value: "", disabled: true }],
            jur_usu_dni: [
                { value: "", disabled: true },],
            jur_usu_ape_pat: [
                { value: "", disabled: true }],
            jur_usu_ape_mat: [
                { value: "", disabled: true }],
            jur_usu_sexo: [{ value: "", disabled: true }],
            jur_idi_id: [{ value: "", disabled: true }],
            jur_pai_id: [{ value: "", disabled: true }],
            jur_reg_id: [{ value: "", disabled: true }],
            jur_pro_id: [{ value: "", disabled: true }],
            jur_dist_id: [{ value: "", disabled: true }],
            jur_usu_direccion: [
                { value: "", disabled: true }
            ],
            jur_usu_celular: [
                { value: "", disabled: true }
            ],
            jur_usu_fech_nacimiento: [
                { value: "", disabled: true }
            ],
            jur_RUC: [
                { value: "", disabled: true }
            ],
            jur_RazonSocial: [
                { value: "", disabled: true }
            ],
            jur_tipoEmpresa: [
                { value: "", disabled: true }
            ],
        });
    }

    actualizarValidacionesCli() {
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.usu_nombres,1,50,"([a-zA-ZñÑáéíóúÁÉÍÓÚs][ ]*)+");
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.usu_dni,3,8,"",8);
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.usu_ape_pat,1,30,"([a-zA-ZñÑáéíóúÁÉÍÓÚs][ ]*)+");
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.usu_ape_mat,1,30,"([a-zA-ZñÑáéíóúÁÉÍÓÚs][ ]*)+");
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.idi_id,2);
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.pai_id,2);
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.reg_id,2);
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.pro_id,2);
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.dist_id,2);
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.usu_direccion,4,150);
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.usu_celular,3,12,"",20,true);
        this.validacionesService.agregarValidaciones(this.clienteForm.controls.usu_fech_nacimiento,2);
    }

    actualizarValidacionesJur(){        
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_usu_nombres,1,50,"([a-zA-ZñÑáéíóúÁÉÍÓÚs][ ]*)+");
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_usu_dni,3,8,"",8);
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_usu_ape_pat,1,30,"([a-zA-ZñÑáéíóúÁÉÍÓÚs][ ]*)+");
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_usu_ape_mat,1,30,"([a-zA-ZñÑáéíóúÁÉÍÓÚs][ ]*)+");
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_idi_id,2);
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_pai_id,2);
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_reg_id,2);
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_pro_id,2);
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_dist_id,2);
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_usu_direccion,4,150);
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_usu_celular,3,12,"",20,true);;
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_usu_fech_nacimiento,2);
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_RUC,3,11,"",11);;
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_RazonSocial,4,100,"^[a-zñáéíóú,. A-ZÑÁÉÍÓÚ  0-9]+$");
        this.validacionesService.agregarValidaciones(this.datosJuridicosForm.controls.jur_tipoEmpresa,2);
    }

    getCliente = () => {
        this.cargandoDatos = true;
        const clientePromise = new Promise((resolve, reject) => {
            let id = Number(localStorage.getItem("USE_ID"));
            let typeUser = Number(localStorage.getItem("USE_TYPE"));
            if (id && id % 1 === 0) {
                this.clienteService.getClienteById(id, typeUser).subscribe(
                    (cliente) => {
                        this.CLIENTE = cliente["Resultado"][0];
                        this.cargandoDatos = false;
                        resolve(this.CLIENTE);
                    },
                    (error) => {
                        this.cargandoDatos = false;
                        this.mostrarAlerta = true;
                        this.tipoAlerta = "danger";
                        if (error["error"]["error"] !== undefined) {
                            if (
                                error["error"]["error"] ===
                                "error_noExistenciaDeIdCli"
                            ) {
                                this.mensajes =
                                    "No se pudo obtener los datos personales del cliente debido a que ya no se encuentra registrado. Por favor, intente de nuevo."
                            } else if (
                                error["error"]["error"] === "error_deBD"
                            ) {
                                this.mensajes =
                                    "Hubo un error al intentar ejecutar su solicitud para obtener los datos personales del cliente. Por favor, intente de nuevo."
                            } else if (
                                error["error"]["error"] === "error_deCampo"
                            ) {
                                this.mensajes =
                                    "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo."
                            }
                        } else {
                            this.mensajes =
                                "Hubo un error al intentar obtener la información personal. Por favor, intente de nuevo"
                        }
                    }
                );
            } else {
                this.cargandoDatos = false;
                this.mostrarAlerta = true;
                this.tipoAlerta = "danger";
                this.mensajes=
                    "Hubo un error al intentar obtener la información personal. Por favor, intente de nuevo"
                reject(this.goToNotFound());
            }
        });
        return clientePromise;
    };

    updateCliente() {
        this.CLIENTE.CLI_TIPO === 1
            ? this.saveValuesClientesJuridico()
            : this.saveValuesClientes();

        this.verificarFecha();
        if (!this.mostrarAlerta) {
            this.cargandoDatosModal = true;
            this.clienteService
                .updateDatosPersonalesCliente(
                    this.CLIENTE,
                    this.JURIDICO
                )
                .subscribe(
                    (mensaje) => {
                        this.mensajes = 
                            "Información personal actualizada correctamente"
                        ;
                        this.mostrarAlerta = true;
                        this.tipoAlerta = "success";
                        this.modal.dismissAll();
                        this.obtenerCliente();
                        this.cargandoDatosModal = false;
                        this.cerrarAlerta();
                    },
                    (error) => {
                        this.cargandoDatosModal = false;
                        this.mostrarAlerta = true;
                        this.tipoAlerta = "warning";
                        if (error["error"]["error"] !== undefined) {
                            if (
                                error["error"]["error"] ===
                                "error_existenciaDeDni"
                            ) {
                                this.mensajes=
                                    "No se pudo actualizar los datos debido a que el DNI ya se encuentra registrado. Por favor, intente de nuevo."
                            } else if (
                                error["error"]["error"] === "error_deBD"
                            ) {
                                this.mensajes=
                                    "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo."
                            } else if (
                                error["error"]["error"] === "error_deCampo"
                            ) {
                                this.mensajes=
                                    "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo."
                            }
                        } else {
                            this.mensajes=
                                "Hubo un error al intentar actualizar los datos. Por favor, intente de nuevo"
                        }
                        this.cerrarAlerta();
                    }
                );
        }
    }

    getIdiomas() {
        this.idiomaService.obtenerIdiomas().subscribe(
            (idiomas) => {
                this.IDIOMAS = idiomas["Resultado"];
            },
            (error) => {
                this.mostrarAlerta = true;
                this.tipoAlerta = "danger";
                if (error["error"]["error"] !== undefined) {
                    if (error["error"]["error"] === "error_deBD") {
                        this.mensajes=
                            "Hubo un error al intentar ejecutar su solicitud para obtener los idiomas. Por favor, intente de nuevo."
                    }
                } else {
                    this.mensajes=
                        "Hubo un error al intentar obtener los idiomas. Por favor, intente de nuevo."
                }
            }
        );
    }

    getPaises() {
        this.paisesService.getPaises().subscribe(
            (paises) => {
                this.PAISES = paises["Resultado"];
            },
            (error) => {
                this.mostrarAlerta = true;
                this.tipoAlerta = "danger";
                if (error["error"]["error"] !== undefined) {
                    if (error["error"]["error"] === "error_deBD") {
                        this.mensajes=
                            "Hubo un error al intentar ejecutar su solicitud para obtener los países. Por favor, intente de nuevo."
                    } else if (error["error"]["error"] === "error_deCampo") {
                        this.mensajes=
                            "Hubo un error al intentar obtener los países. Por favor, intente de nuevo."
                    }
                } else {
                    this.mensajes=
                        "Hubo un error al intentar obtener los países. Por favor, intente de nuevo."
                }
            }
        );
    }

    getRegiones = (idPais: number) => {
        const regionesPromise = new Promise((resolve, reject) => {
            if (idPais != null && idPais !== undefined) {
                this.regionesService.getRegiones(idPais).subscribe(
                    (regiones) => {
                        this.REGIONES = regiones["Resultado"];
                        resolve(this.REGIONES);
                    },
                    (error) => {
                        this.mostrarAlerta = true;
                        this.tipoAlerta = "danger";
                        if (error["error"]["error"] !== undefined) {
                            if (
                                error["error"]["error"] ===
                                "error_noExistenciaDeIdPai"
                            ) {
                                this.mensajes=
                                    "No se pudo obtener las regiones debido a que no se encontró el país que le corresponde. Por favor, intente de nuevo."
                            } else if (
                                error["error"]["error"] === "error_deBD"
                            ) {
                                this.mensajes=
                                    "Hubo un error al intentar ejecutar su solicitud para obtener las regiones. Por favor, intente de nuevo."
                            } else if (
                                error["error"]["error"] === "error_deCampo"
                            ) {
                                this.mensajes=
                                    "Hubo un error al intentar obtener las regiones. Por favor, intente de nuevo."
                            }
                        } else {
                            this.mensajes=
                                "Hubo un error al intentar obtener las regiones. Por favor, intente de nuevo."
                        }
                    }
                );
            }
        });
        return regionesPromise;
    };

    getProvincias = (idRegion: number) => {
        const provinciasPromise = new Promise((resolve, reject) => {
            if (idRegion != null && idRegion !== undefined) {
                this.provinciaService.getProvincias(idRegion).subscribe(
                    (provincias) => {
                        this.PROVINCIAS = provincias["Resultado"];
                        resolve(this.PROVINCIAS);
                    },
                    (error) => {
                        this.mostrarAlerta = true;
                        this.tipoAlerta = "danger";
                        if (error["error"]["error"] !== undefined) {
                            if (
                                error["error"]["error"] ===
                                "error_noExistenciaDeIdReg"
                            ) {
                                this.mensajes=
                                    "No se pudo obtener las provincias debido a que no se encontró la región que le corresponde. Por favor, intente de nuevo."
                            } else if (
                                error["error"]["error"] === "error_deBD"
                            ) {
                                this.mensajes=
                                    "Hubo un error al intentar ejecutar su solicitud para obtener las provincias. Por favor, intente de nuevo."
                            } else if (
                                error["error"]["error"] === "error_deCampo"
                            ) {
                                this.mensajes=
                                    "Hubo un error al intentar obtener las provincias. Por favor, intente de nuevo."
                            }
                        } else {
                            this.mensajes=
                                "Hubo un error al intentar obtener las provincias. Por favor, intente de nuevo."
                        }
                    }
                );
            }
        });
        return provinciasPromise;
    };

    getDistritos = (idProvincia: number) => {
        const distritosPromise = new Promise((resolve, reject) => {
            if (idProvincia != null && idProvincia !== undefined) {
                this.distritoService.getDistrito(idProvincia).subscribe(
                    (distritos) => {
                        this.DISTRITOS = distritos["Resultado"];
                        resolve(this.DISTRITOS);
                    },
                    (error) => {
                        this.mostrarAlerta = true;
                        this.tipoAlerta = "danger";
                        if (error["error"]["error"] !== undefined) {
                            if (
                                error["error"]["error"] ===
                                "error_noExistenciaDeIdPro"
                            ) {
                                this.mensajes=
                                    "No se pudo obtener los distritos debido a que no se encontró la provincia que le corresponde. Por favor, intente de nuevo."
                            } else if (
                                error["error"]["error"] === "error_deBD"
                            ) {
                                this.mensajes=
                                    "Hubo un error al intentar ejecutar su solicitud para obtener los distritos. Por favor, intente de nuevo."
                            } else if (
                                error["error"]["error"] === "error_deCampo"
                            ) {
                                this.mensajes=
                                    "Hubo un error al intentar obtener los distritos. Por favor, intente de nuevo."
                            }
                        } else {
                            this.mensajes=
                                "Hubo un error al intentar obtener los distritos. Por favor, intente de nuevo."
                        }
                    }
                );
            }
        });
        return distritosPromise;
    };

    getTiposEmpresas = () => {
        const tipoEmpresaPromise = new Promise((resolve, reject) => {
            this.tipoEmpresaService.getTipoEmpresa().subscribe(
                (tipoEmpresa) => {
                    this.TIPOSEMPRESAS = tipoEmpresa["Resultado"];
                    resolve(this.TIPOSEMPRESAS);
                },
                (error) => {
                    this.mostrarAlerta = true;
                    this.tipoAlerta = "danger";
                    if (error["error"]["error"] !== undefined) {
                        if (error["error"]["error"] === "error_deBD") {
                            this.mensajes=
                                "Hubo un error al intentar ejecutar su solicitud para obtener los datos de  tipo de empresa. Por favor, intente de nuevo."
                        } else if (
                            error["error"]["error"] === "error_deCampo"
                        ) {
                            this.mensajes=
                                "Hubo un error al intentar obtener los datos de tipo de empresa. Por favor, intente de nuevo."
                        }
                    } else {
                        this.mensajes=
                            "Hubo un error al intentar obtener los datos de tipo de empresa. Por favor, intente de nuevo."
                    }
                }
            );
        });
        return tipoEmpresaPromise;
    };

    getTipoEmpresaByCliente = (idCliente: number) => {
        const tipoEmpresaPromise = new Promise((resolve, reject) => {
            if (idCliente != null && idCliente !== undefined) {
                this.tipoEmpresaService
                    .getTipoEmpresaByIdCliente(idCliente)
                    .subscribe(
                        (tipoEmpresa) => {
                            this.TIPOEMPRESA = tipoEmpresa["Resultado"];
                            resolve(this.TIPOEMPRESA);
                        },
                        (error) => {
                            this.mostrarAlerta = true;
                            this.tipoAlerta = "danger";
                            if (error["error"]["error"] !== undefined) {
                                if (
                                    error["error"]["error"] ===
                                    "error_noExistenciaDeIdCli"
                                ) {
                                    this.mensajes = 
                                        "No se pudo obtener los datos de tipo de empresa debido a que no se encontró el cliente. Por favor, intente de nuevo.";
                                } else if (
                                    error["error"]["error"] === "error_deBD"
                                ) {
                                    this.mensajes = 
                                        "Hubo un error al intentar ejecutar su solicitud para obtener el tipo de empresa. Por favor, intente de nuevo.";
                                } else if (
                                    error["error"]["error"] === "error_deCampo"
                                ) {
                                    this.mensajes = 
                                        "Hubo un error al intentar obtener el tipo de empresa. Por favor, intente de nuevo.";
                                }
                            } else {
                                this.mensajes = 
                                    "Hubo un error al intentar obtener el tipo de empresa. Por favor, intente de nuevo.";
                            }
                        }
                    );
            }
        });
        return tipoEmpresaPromise;
    };

    getJuridicoByCliente = (idCliente: number) => {
        const juridicoPromise = new Promise((resolve, reject) => {
            if (idCliente != null && idCliente !== undefined) {
                this.juridicoService
                    .obtenerDatosJuridicosPorCliente(idCliente)
                    .subscribe(
                        (juridico) => {
                            this.JURIDICO = juridico["Resultado"];
                            /* this.updateValuesClientesJuridico(); */
                            resolve(this.JURIDICO);
                        },
                        (error) => {
                            this.mostrarAlerta = true;
                            this.tipoAlerta = "danger";
                            if (error["error"]["error"] !== undefined) {
                                if (
                                    error["error"]["error"] ===
                                    "error_noExistenciaDeIdCli"
                                ) {
                                    this.mensajes = 
                                        "No se pudo obtener los datos jurídicos debido a que no se encontró el cliente. Por favor, intente de nuevo."
                                } else if (
                                    error["error"]["error"] === "error_deBD"
                                ) {
                                    this.mensajes = 
                                        "Hubo un error al intentar ejecutar su solicitud para obtener los datos jurídicos. Por favor, intente de nuevo."
                                } else if (
                                    error["error"]["error"] === "error_deCampo"
                                ) {
                                    this.mensajes = 
                                        "Hubo un error al intentar obtener los datos jurídicos. Por favor, intente de nuevo."
                                }
                            } else {
                                this.mensajes = 
                                    "Hubo un error al intentar obtener los datos jurídicos. Por favor, intente de nuevo."
                            }
                        }
                    );
            }
        });
        return juridicoPromise;
    };

    cambiarPais() {
        this.REGIONES = [];
        this.PROVINCIAS = [];
        this.DISTRITOS = [];

        this.reg_id.setValue(null);
        this.pro_id.setValue(null);
        this.dist_id.setValue(null);

        if (this.pai_id.value != null || this.pai_id.value !== undefined) {
            this.CLIENTE.PAI_ID = this.pai_id.value;
            this.getRegiones(this.pai_id.value);
        }
    }

    cambiarRegion() {
        this.PROVINCIAS = [];
        this.DISTRITOS = [];

        this.pro_id.setValue(null);
        this.dist_id.setValue(null);

        if (this.reg_id.value != null || this.reg_id.value !== undefined) {
            this.CLIENTE.REG_ID = this.reg_id.value;
            this.getProvincias(this.reg_id.value);
        }
    }

    cambiarRegionJuridico() {
        this.PROVINCIAS = [];
        this.DISTRITOS = [];

        this.jur_pro_id.setValue(null);
        this.jur_dist_id.setValue(null);

        if (
            this.jur_reg_id.value != null ||
            this.jur_reg_id.value !== undefined
        ) {
            this.CLIENTE.REG_ID = this.jur_reg_id.value;
            this.getProvincias(this.jur_reg_id.value);
        }
    }

    cambiarProvincia() {
        this.DISTRITOS = [];

        this.dist_id.setValue(null);

        if (this.pro_id.value != null || this.pro_id.value !== undefined) {
            this.CLIENTE.PRO_ID = this.pro_id.value;
            this.getDistritos(this.pro_id.value);
        }
    }

    cambiarProvinciaJuridico() {
        this.DISTRITOS = [];

        this.jur_dist_id.setValue(null);

        if (
            this.jur_pro_id.value != null ||
            this.jur_pro_id.value !== undefined
        ) {
            this.CLIENTE.PRO_ID = this.jur_pro_id.value;
            this.getDistritos(this.jur_pro_id.value);
        }
    }

    cambiarTipoEmpresa($e) {
        let tipo_empresa = $e.split(" ")[1];

        let number_type_Empresa = $e;
        if (Number(number_type_Empresa.toString().substring(0, 1)) == 0) {
            this.jur_tipoEmpresa.setValue(null);
        } else {
            this.jur_tipoEmpresa.setValue(tipo_empresa);
            this.tipoEmpresaID = Number(
                number_type_Empresa.toString().substring(0, 1)
            );
        }
    }

    updateValuesClientes() {
        this.usu_nombres.setValue(this.CLIENTE.USU_NOMBRES);
        this.usu_dni.setValue(this.CLIENTE.USU_DNI);
        this.usu_ape_pat.setValue(this.CLIENTE.USU_APE_PAT);
        this.usu_ape_mat.setValue(this.CLIENTE.USU_APE_MAT);
        this.usu_sexo.setValue(this.CLIENTE.USU_SEXO);
        this.idi_id.setValue(this.CLIENTE.IDI_ID);
        this.pai_id.setValue(this.CLIENTE.PAI_ID);
        this.reg_id.setValue(this.CLIENTE.REG_ID);
        this.pro_id.setValue(this.CLIENTE.PRO_ID);
        this.dist_id.setValue(this.CLIENTE.DIST_ID);
        this.usu_direccion.setValue(this.CLIENTE.USU_DIRECCION);
        this.usu_celular.setValue(this.CLIENTE.USU_CELULAR);
        this.usu_fech_nacimiento.setValue(this.CLIENTE.USU_FECH_NACIMIENTO);
    }

    abrirModalActualizacion() {
        this.actualizarValidacionesCli();
        this.actualizarValidacionesJur();
        if (this.CLIENTE.CLI_TIPO == 0) {
            if(this.clienteForm.invalid){
                this.clienteForm.markAllAsTouched();
                return;
            }
        }else{
            if(this.datosJuridicosForm.invalid){
                this.datosJuridicosForm.markAllAsTouched();
                return;
            }
        }
        this.modal.open(this.elementModalConfirmacion);
    }

    cerrarModal() {
        this.modal.dismissAll();
    }

    obtenerFechaMinima() {
        const fechaActual = this.datePipe
            .transform(new Date(), "yyyy-MM-dd")
            .split("-");
        const dia = fechaActual[2];
        const mes = fechaActual[1];
        const anio = Number(fechaActual[0]) - 18;

        this.maxFecha = anio + "-" + mes + "-" + dia;
    }

    goToNotFound() {
        this.router.navigate(["not-found"]);
    }

    saveValuesClientes() {
        this.CLIENTE.USU_NOMBRES = this.usu_nombres.value;
        this.CLIENTE.USU_DNI = this.usu_dni.value;
        this.CLIENTE.USU_APE_PAT = this.usu_ape_pat.value;
        this.CLIENTE.USU_APE_MAT = this.usu_ape_mat.value;
        this.CLIENTE.USU_SEXO = this.usu_sexo.value;
        this.CLIENTE.IDI_ID = this.idi_id.value;
        this.CLIENTE.PAI_ID = this.pai_id.value;
        this.CLIENTE.REG_ID = this.reg_id.value;
        this.CLIENTE.PRO_ID = this.pro_id.value;
        this.CLIENTE.DIST_ID = this.dist_id.value;
        this.CLIENTE.USU_DIRECCION = this.usu_direccion.value;
        this.CLIENTE.USU_CELULAR = this.usu_celular.value;
        this.CLIENTE.USU_FECH_NACIMIENTO = this.usu_fech_nacimiento.value;
    }

    saveValuesClientesJuridico() {
        this.CLIENTE.USU_NOMBRES = this.jur_usu_nombres.value;
        this.CLIENTE.USU_DNI = this.jur_usu_dni.value;
        this.CLIENTE.USU_APE_PAT = this.jur_usu_ape_pat.value;
        this.CLIENTE.USU_APE_MAT = this.jur_usu_ape_mat.value;
        this.CLIENTE.USU_SEXO = this.jur_usu_sexo.value;
        this.CLIENTE.IDI_ID = this.jur_idi_id.value;
        this.CLIENTE.PAI_ID = this.jur_pai_id.value;
        this.CLIENTE.REG_ID = this.jur_reg_id.value;
        this.CLIENTE.PRO_ID = this.jur_pro_id.value;
        this.CLIENTE.DIST_ID = this.jur_dist_id.value;
        this.CLIENTE.USU_DIRECCION = this.jur_usu_direccion.value;
        this.CLIENTE.USU_CELULAR = this.jur_usu_celular.value;
        this.CLIENTE.USU_FECH_NACIMIENTO = this.jur_usu_fech_nacimiento.value;
        this.CLIENTE.USU_RUC = this.jur_RUC.value;
        this.CLIENTE.USU_RUC = this.jur_RUC.value;
        this.JURIDICO.JUR_RAZ_SOCIAL = this.jur_RazonSocial.value;
        this.TIPOEMPRESA.TIP_EMP_CLAVE = this.jur_tipoEmpresa.value;
    }

    verificarFecha() {
        const fechaActual = new Date();
        this.mensajes = "";

        if (
            this.CLIENTE.USU_FECH_NACIMIENTO >=
            this.datePipe.transform(fechaActual.toDateString(), "yyyy-MM-dd")
        ) {
            this.mensajes="La fecha de nacimiento no es válida";
            this.tipoAlerta = "danger";
            this.mostrarAlerta = true;
        }
        if (this.maxFecha < this.CLIENTE.USU_FECH_NACIMIENTO) {
            this.mensajes=
                "Debe ser mayor de edad para que la fecha sea válida";
            this.tipoAlerta = "danger";
            this.mostrarAlerta = true;
        }
    }

    obtenerFechaMaxima() {
        const fechaActual = this.datePipe
            .transform(new Date(), "yyyy-MM-dd")
            .split("-");
        const dia = fechaActual[2];
        const mes = fechaActual[1];
        const anio = Number(fechaActual[0]) - 18;

        this.maxFecha = anio + "-" + mes + "-" + dia;
    }

    get usu_nombres() {
        return this.clienteForm.get("usu_nombres");
    }

    get usu_dni() {
        return this.clienteForm.get("usu_dni");
    }

    get usu_ape_pat() {
        return this.clienteForm.get("usu_ape_pat");
    }

    get usu_ape_mat() {
        return this.clienteForm.get("usu_ape_mat");
    }

    get usu_sexo() {
        return this.clienteForm.get("usu_sexo");
    }

    get idi_id() {
        return this.clienteForm.get("idi_id");
    }

    get pai_id() {
        return this.clienteForm.get("pai_id");
    }

    get reg_id() {
        return this.clienteForm.get("reg_id");
    }

    get pro_id() {
        return this.clienteForm.get("pro_id");
    }

    get dist_id() {
        return this.clienteForm.get("dist_id");
    }

    get usu_direccion() {
        return this.clienteForm.get("usu_direccion");
    }

    get usu_celular() {
        return this.clienteForm.get("usu_celular");
    }

    get usu_fech_nacimiento() {
        return this.clienteForm.get("usu_fech_nacimiento");
    }

    /*****************  PARA CLIENTE JURIDICO **********************************/

    updateValuesClientesJuridico() {
        this.jur_usu_nombres.setValue(this.CLIENTE.USU_NOMBRES);
        this.jur_usu_dni.setValue(this.CLIENTE.USU_DNI);
        this.jur_usu_ape_pat.setValue(this.CLIENTE.USU_APE_PAT);
        this.jur_usu_ape_mat.setValue(this.CLIENTE.USU_APE_MAT);
        this.jur_usu_sexo.setValue(this.CLIENTE.USU_SEXO);
        this.jur_idi_id.setValue(this.CLIENTE.IDI_ID);
        this.jur_pai_id.setValue(this.CLIENTE.PAI_ID);
        this.jur_reg_id.setValue(this.CLIENTE.REG_ID);
        this.jur_pro_id.setValue(this.CLIENTE.PRO_ID);
        this.jur_dist_id.setValue(this.CLIENTE.DIST_ID);
        this.jur_usu_direccion.setValue(this.CLIENTE.USU_DIRECCION);
        this.jur_usu_celular.setValue(this.CLIENTE.USU_CELULAR);
        this.jur_usu_fech_nacimiento.setValue(this.CLIENTE.USU_FECH_NACIMIENTO);
        this.jur_RUC.setValue(this.CLIENTE.USU_RUC);
        this.jur_RazonSocial.setValue(this.JURIDICO.JUR_RAZ_SOCIAL);
        this.jur_tipoEmpresa.setValue(this.TIPOEMPRESA.TIP_EMP_CLAVE);
    }

    get jur_usu_nombres() {
        return this.datosJuridicosForm.get("jur_usu_nombres");
    }

    get jur_usu_dni() {
        return this.datosJuridicosForm.get("jur_usu_dni");
    }

    get jur_usu_ape_pat() {
        return this.datosJuridicosForm.get("jur_usu_ape_pat");
    }

    get jur_usu_ape_mat() {
        return this.datosJuridicosForm.get("jur_usu_ape_mat");
    }

    get jur_usu_sexo() {
        return this.datosJuridicosForm.get("jur_usu_sexo");
    }

    get jur_idi_id() {
        return this.datosJuridicosForm.get("jur_idi_id");
    }

    get jur_pai_id() {
        return this.datosJuridicosForm.get("jur_pai_id");
    }

    get jur_reg_id() {
        return this.datosJuridicosForm.get("jur_reg_id");
    }

    get jur_pro_id() {
        return this.datosJuridicosForm.get("jur_pro_id");
    }

    get jur_dist_id() {
        return this.datosJuridicosForm.get("jur_dist_id");
    }

    get jur_usu_direccion() {
        return this.datosJuridicosForm.get("jur_usu_direccion");
    }

    get jur_usu_celular() {
        return this.datosJuridicosForm.get("jur_usu_celular");
    }

    get jur_usu_fech_nacimiento() {
        return this.datosJuridicosForm.get("jur_usu_fech_nacimiento");
    }

    get jur_RUC() {
        return this.datosJuridicosForm.get("jur_RUC");
    }

    get jur_RazonSocial() {
        return this.datosJuridicosForm.get("jur_RazonSocial");
    }

    get jur_tipoEmpresa() {
        return this.datosJuridicosForm.get("jur_tipoEmpresa");
    }

    cerrarAlerta(){
        setTimeout(() => {
          this.mostrarAlerta=false;
        }, 5000);
    }
}
