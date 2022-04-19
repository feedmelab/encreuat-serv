import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";
import axios from "axios";

@SocketController()
export class RoomController {
	@OnMessage("join_game")
	public async joinGame(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: any) {
		console.log("Nou jugador entrant a la sala: ", message);

		const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);
		const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);

		const makeAPICall = async () => {
			try {
				const paraules = [
					"camí",
					"rossinyol",
					"conill",
					"cogombre",
					"pastís",
					"mussol",
					"serra",
					"colònia",
					"atzucac",
					"rèmora",
					"cendrer",
					"cotó",
					"cargol",
					"bobina",
					"encreuat",
				];
				const ran = Math.floor(Math.random() * paraules.length);
				const paraulaDelDia = encodeURIComponent(paraules[ran]);
				const data = await axios.get("https://vilaweb.cat/paraulogic/?diec=" + paraulaDelDia);
				const resultParsed = { ...data.data };
				const afterLast = (value: string, delimiter: string) => {
					value = value || "";
					return delimiter === "" ? value : value.split(delimiter)[3];
				};
				let replaced = resultParsed.d.replace(/\ xmlns:fo="http:\/\/www\.w3\.org\/1999\/XSL\/Format"/g, "");
				let rreplaced = afterLast(replaced, 'body">').split("</span>")[0].replace(/['"]+/g, "").replace(/<I>/g, "").replace(/<\/I>/g, "");
				let parsedParaula = paraulaDelDia.substring(0, paraulaDelDia.indexOf("%"));
				let result = [[decodeURIComponent(paraulaDelDia)], [rreplaced.replace(/`${parsedParaula}`/g, "*****")]];
				console.log(result);
				return result;
			} catch (e) {
				return e;
			}
		};

		if (socketRooms.length > 0 || (connectedSockets && connectedSockets.size === 2)) {
			socket.emit("room_join_error", {
				error: `La sala ${message.roomId} ja esta plena, escull-ne una altra!`,
			});
		} else {
			await socket.join(message.roomId);
			socket.emit("room_joined");

			if (io.sockets.adapter.rooms.get(message.roomId).size === 2) {
				const preguntes: [] = await makeAPICall();
				const nom: string = String([...preguntes][0]);
				const desc: string = String([...preguntes][1]);

				socket.emit("start_game", { start: true, symbol: "A", room: message.roomId, all: nom, desc: desc });
				socket.to(message.roomId).emit("start_game", { start: false, symbol: "B", room: message.roomId, all: nom, desc: desc });
			}
		}
	}
}
