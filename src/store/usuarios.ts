import { defineStore } from 'pinia'
import { UsuariosService } from '@/services/UsuariosService'
import { UsuarioViewDTO } from "@/interfaces/Usuario"
import { FaccionDTO } from "@/interfaces/Faccion"
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario"
import { NewUserDTO } from "@/interfaces/Usuario"
import { UsuarioDataDTO } from "@/interfaces/Usuario"
import { EditarFaccionDTO } from "@/interfaces/Faccion";

interface usuariosState {
  usuario: UsuarioViewDTO
  usuarios: ViewUsuarioPartidaDTO[]
  usuariosPartidas: Array<any>
  usuarioData: UsuarioDataDTO
}


export const useUsuariosStore = defineStore('usuarios', {
  state: ():usuariosState => (
    {
      usuario: {
        idUsuario: 0,
        nombreUsuario: '',
        primerApellido: '',
        segundoApellido: '',
        email: '',
        nick: '',
        ciudad: '',
        fechaRegistro: '',
        fechaNacimiento: '',
        faccion: {
          idFaccion: -1,
          nombreFaccion: '',
        },
        idFaccion: -1,
        telefono: '',
      },
      usuarios: [],
      usuariosPartidas: [],
      usuarioData: {
        idUsuario: 0,
        nick: '',
        email: '',
        faccion: {
          idFaccion: -1,
          nombreFaccion: '',
        },
        partidasValidadas: [],
        partidasPendientes: [],
        elos: [],
        inscripcionesTorneo: [],
        clasificacionElo: 0,
        puntuacionElo: 0,
        numeroPartidasJugadas: 0,
        partidasGanadas: 0,
        partidasEmpatadas: 0,
        partidasPerdidas: 0,
      }
    }
  ),
  actions: {
    requestUsuario(email: string) {
      return new Promise((resolve, reject) => {
        UsuariosService.getUsuario(email)
          .then((response: any) => {
            this.usuario = response.data
            resolve(response.data)
          })
          .catch((err: any) => {
            reject(err)
          })
      })
    },
    requestUsuarios() {
      return new Promise((resolve, reject) => {
        UsuariosService.getUsuarios()
          .then((response: any) => {
            this.usuarios = response.data
            resolve(response.data)
          })
          .catch((err: any) => {
            reject(err)
          })
      })
    },
    requestUsuariosPartidas(email: string) {
      return new Promise((resolve, reject) => {
        UsuariosService.getUsuarioPartidas(email)
          .then((response: any) => {
            this.usuariosPartidas = response.data
            resolve(response.data)
          })
          .catch((err: any) => {
            reject(err)
          })
      })
    },
    requestUsuarioData(idUsuario: number) {
      return new Promise((resolve, reject) => {
        UsuariosService.getUsuarioData(idUsuario)
          .then((response: any) => {
            this.usuarioData = response.data
            resolve(response.data)
          })
          .catch((err: any) => {
            reject(err)
          })
      })
    },
    requestNickById(idUsuario: number) {
      return new Promise((resolve, reject) => {
        UsuariosService.getNickById(idUsuario)
          .then((response: any) => {
            resolve(response.data)
          })
          .catch((err: any) => {
            reject(err)
          })
      })
    },
    setFaccion(body: EditarFaccionDTO) {
      return new Promise((resolve, reject) => {
        UsuariosService.editarFaccion(body)
          .then((response: any) => {
            resolve(response)
          })
          .catch((err: any) => {
            reject(err)
          })
      })
    },
    postUser(newUser: NewUserDTO) {
      return new Promise((resolve, reject) => {
        UsuariosService.newUser(newUser)
          .then((response: any) => {
            resolve(response)
          })
          .catch((err: any) => {
            reject(err)
          })
      })
    },
    editarUsuario(json: any) {
      return new Promise((resolve, reject) => {
        UsuariosService.editarUsuario(json)
          .then((response: any) => {
            resolve(response)
          })
          .catch((err: any) => {
            reject(err)
          })
      })
    },
    setUsuarioFaccion(faccion: FaccionDTO) {
      this.usuario.faccion = faccion
    }
  },
})
