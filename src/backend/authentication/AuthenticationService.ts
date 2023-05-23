/* eslint-disable*/

export interface AuthenticationService {
    login(id: string, password: string): Promise<string>;
    logout(token: string): Promise<void>;
    register(id: string, password: string): Promise<void>;
    validateToken(token: string): Promise<boolean>;
  }
  