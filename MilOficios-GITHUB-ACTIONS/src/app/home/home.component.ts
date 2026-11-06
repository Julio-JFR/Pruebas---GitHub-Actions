import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],   
    animations: [routerTransition()]
})
export class HomeComponent implements OnInit {
    cardClienteContainer = this.createCardCliente();
    cardEspecialistaContainer = this.createCardEspecialista();
    whatsappContact: string;
    linkedinContact: string;
    mailContact: string;
    imagenUrl:string;
    tituloUrl:string;
    checkCookies:boolean;  

    constructor(
        private router: Router,
        private modalService: NgbModal,

    ) {
    }

    ngOnInit() {
        this.checkCookies = localStorage.getItem('cookieConsent') === 'true';
        this.whatsappContact = "https://wa.me/999913347";
        this.linkedinContact = "https://www.linkedin.com/company/openai/";
        this.mailContact = "mailto:correoMO@gmail.com";
    }

    createCardCliente() {
        return [
            {
                img: "../../assets/images/homeImages/SERIVICIO1.png",
                text: "1. Regístrate con nosotros y accede a través de tu cuenta.",
                header: 'Registra tu cuenta'
            },
            {
                img: "../../assets/images/homeImages/SERIVICIO2.png",
                text: "2. Busca a través de las categorías y elige el servicio que deseas contratar.",
                header: 'Solicita un servicio'
            },
            {
                img: "../../assets/images/homeImages/SERIVICIO3.png",
                text: "3. Ingresa los datos de tu solicitud: describe tu necesidad, anexa fotos, indica tu ubicación.",
                header: 'Detalla tu solicitud'
            },
            {
                img: "../../assets/images/homeImages/SERIVICIO4.png",
                text: "4. Un especialista cercano será asignado y se te notificará con sus datos.",
                header: 'Revisa el detalle de tu solicitud'
            },
            {
                img: "../../assets/images/homeImages/SERIVICIO5.png",
                text: "5. Confirma a tu especialista, realiza el pago de tu servicio y recibe la confirmación de la programación de tu servicio.",
                header: 'Confirma a tu especialista'
            },
            {
                img: "../../assets/images/homeImages/SERIVICIO6.png",
                text: "6. Después de la realización de tu servicio califica al especialista y a nuestro servicio.",
                header: 'Califica al especialista y nuestro servicio'
            }
        ];
    }

    createCardEspecialista() {
        return [
            {
                img: "../../assets/images/homeImages/POST1.png",
                text: "1.	Regístrate con nosotros como postulante, ingresa tus datos personales, tus datos académicos, tu experiencia laboral y envía tu solicitud. Nuestro equipo evaluará tus datos y te notificaremos los resultados.",
                header:'Registra tu cuenta'
            },
            {
                img: "../../assets/images/homeImages/POST2.png",
                text: "2.	Una vez confirmada tu admisión, podrás usar tu cuenta de postulante para acceder como especialista. Accede como especialista y elige los servicios que deseas realizar.",
                header:'Accede como especialista'
            },
            {
                img: "../../assets/images/homeImages/POST3.png",
                text: "3.	Recibe la confirmación de aceptación del cliente y programación de tu servicio.",
                header:'Revisa tus confirmaciones de trabajo'
            },
            {
                img: "../../assets/images/homeImages/POST4.png",
                text: "4.	Revisa tus servicios programados y atiéndelos en orden cronológico. Consulta el detalle de cada servicio para recordar el detalle de la solicitud, los datos de tu cliente y la ruta hacia el lugar pactado.",
                header:'Revisa tus servicios programados'
            },
            {
                img: "../../assets/images/homeImages/POST5.png",
                text: "5.	Selecciona “Iniciar servicio” en nuestra plataforma y procede a realizar tu servicio. No olvides llegar a tiempo y cumplir con todo el detalle indicado por el cliente en la descripción de su solicitud.",
                header:'Inicia el servicio'
            },
            {
                img: "../../assets/images/homeImages/POST6.png",
                text: "6.	Al terminar, selecciona “finalizar servicio” e ingresa los detalles del trabajo realizado. Esto servirá para notificar a tu cliente con la confirmación de finalización del servicio. ",
                header:'Finaliza el servicio'
            }
        ];
    }

    redirectToLogin(url){
        this.router.navigate([url]);
    }

    open(content,imagenUrl,titulo) {
        this.imagenUrl = imagenUrl;
        this.tituloUrl = titulo;
        this.modalService.open(content, {size: 'xl'});
    }

    abrirVentana(){
        const rutaPolitica:string=environment.domain_url+'/archivos/';
        window.open(rutaPolitica+'PoliticaDeCookies.pdf', "_blank");
    }

    aceptarCookies(){
        this.checkCookies = true;
        localStorage.setItem('cookieConsent', this.checkCookies ? 'true' : 'false');
    }
}