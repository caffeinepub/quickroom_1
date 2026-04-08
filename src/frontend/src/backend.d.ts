import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    text: string;
    sender: string;
    timestamp: bigint;
}
export interface User {
    displayName: string;
    sessionToken: string;
    lastActive: bigint;
}
export interface backendInterface {
    createRoom(): Promise<string>;
    getActiveUsers(roomId: string): Promise<Array<User>>;
    getMessages(roomId: string): Promise<Array<Message>>;
    joinRoom(roomId: string, displayName: string | null): Promise<string>;
    leaveRoom(roomId: string, sessionToken: string): Promise<void>;
    ping(roomId: string, sessionToken: string): Promise<void>;
    roomExists(roomId: string): Promise<boolean>;
    sendMessage(roomId: string, sessionToken: string, messageText: string): Promise<void>;
}
