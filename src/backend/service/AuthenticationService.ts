/* eslint-disable*/
export interface AuthenticationService {
    login(id: string, password: string): Promise<string>;
  }
  