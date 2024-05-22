import { ITorneo } from "@/interfaces/Torneo";

export const getTorneosMock = async () => {
    const listaTorneos: ITorneo[] = [
        {
            ID_Torneo: 1,
            ID_Usuario: 123,
            Nombre_Torneo: 'Torneo de AMoncat',
            Descripción_Torneo: 'Torneo por parejas donde uno gana y otro pierde',
            Fecha_Inicio_Torneo: new Date('2024-05-20'),
            Fecha_Fin_Torneo: new Date('2024-05-22'),
            Precio_Torneo: 20,
            Numero_Partidas: 3,
            Puntos_Torneo: 500,
            Estado_Torneo: 'ESPERANDO',
            Lugar_Torneo: 'Casa de AM',
            Tipo_Torneo: 'Personalizado',
            Es_Privado_Torneo: false,
            ID_Rango_Torneo: 1,
            Es_Matched_Play_Torneo: true,
            Fecha_Entrega_Listas: new Date('2024-05-19'),
            Fecha_Fin_Inscripcion: new Date('2024-05-18'),
            Bases_Torneo: 'Aqui viene un PDF en base 64',
            Cartel_Torneo: 'imagen_torneo.jpg',
            Metodos_Pago: ['PayPal', 'Transferencia Bancaria'],
            Hora_Inicio_Torneo: '09:00',
            Hora_Fin_Torneo: '18:00',
            Limite_Plazas: 50
        },
        {
            ID_Torneo: 2,
            ID_Usuario: 456,
            Nombre_Torneo: 'Gran Torneo de Verano',
            Descripción_Torneo: '¡El torneo más grande del año! Ven y demuestra tus habilidades en este evento épico.',
            Fecha_Inicio_Torneo: new Date('2024-07-10'),
            Fecha_Fin_Torneo: new Date('2024-07-12'),
            Precio_Torneo: 30,
            Numero_Partidas: 8,
            Puntos_Torneo: 200,
            Estado_Torneo: 'LIVE',
            Lugar_Torneo: 'Centro de Convenciones',
            Tipo_Torneo: 'Torneo de Estrategia',
            Es_Privado_Torneo: false,
            ID_Rango_Torneo: 789,
            Es_Matched_Play_Torneo: false,
            Fecha_Entrega_Listas: new Date('2024-07-09'),
            Fecha_Fin_Inscripcion: new Date('2024-07-08'),
            Bases_Torneo: 'Reglas detalladas del torneo...',
            Cartel_Torneo: 'gran_torneo_verano.jpg',
            Metodos_Pago: ['Tarjeta de crédito', 'Efectivo'],
            Hora_Inicio_Torneo: '10:00',
            Hora_Fin_Torneo: '20:00',
            Limite_Plazas: 30
        },
        {
            ID_Torneo: 3,
            ID_Usuario: 789,
            Nombre_Torneo: 'Torneo Relámpago',
            Descripción_Torneo: '¡Un torneo rápido y emocionante para aquellos que buscan acción inmediata!',
            Fecha_Inicio_Torneo: new Date('2024-06-05'),
            Fecha_Fin_Torneo: new Date('2024-06-05'),
            Precio_Torneo: 10,
            Numero_Partidas: 5,
            Puntos_Torneo: 350,
            Estado_Torneo: 'TERMINADO',
            Lugar_Torneo: 'Casa de Torre',
            Tipo_Torneo: 'Personalizado',
            Es_Privado_Torneo: false,
            ID_Rango_Torneo: 3,
            Es_Matched_Play_Torneo: true,
            Fecha_Entrega_Listas: new Date('2024-06-04'),
            Fecha_Fin_Inscripcion: new Date('2024-06-03'),
            Bases_Torneo: 'Aqui viene un PDF en base 64 para descargar',
            Cartel_Torneo: 'torneo_relampago.jpg',
            Metodos_Pago: ['PayPal'],
            Hora_Inicio_Torneo: '09:00',
            Hora_Fin_Torneo: '18:00'
        }
    ]    
    return listaTorneos;
};

export const getTorneoByIdMock = async (id:number) =>{
    const listaTorneos = getTorneosMock()
    const torneo = (await listaTorneos).find(x => x.ID_Torneo === id);
    return torneo;
};