import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

const AUTH_URL = process.env.AUTH_URL || 'http://localhost:7081'


@Injectable()
export class AuthService{
  constructor(
    private httpService: HttpService
  ) {}
  
  async getLoginProfile(id: string): Promise<any>{
    const url = `${AUTH_URL}/login-profile/by-id?id=${id}`
    return this.httpService.get(url).toPromise();
  }

  async getToken(){
    const url = `${AUTH_URL}/auth/system-login`;

    try{
      let res = await this.httpService.post<{accessToken: string}>(url, {
        username: "systemuserfdbkn@gmail.com", 
        password: "cdnkjn^%567fnfdkjnk98323293"
      }).toPromise();
      return res.data.accessToken;
    }catch(err){
      console.log(err);
      return null;
    }
  }

  async addLoginProfile(email: string, password: string, role: string, token: string): Promise<any>{
    const url = `${AUTH_URL}/login-profile/`;
    try{
      return await this.httpService.post(url, {
        userName: email, 
        password: password,
        roles: [role]
      }, {headers: {
        "Authorization": "Bearer " + token
      }}).toPromise();
    }catch(err){
      console.log(err);
      return null;
    }
  }

  async getRolese(token: string): Promise<any>{
    const url = `${AUTH_URL}/role`
    return this.httpService.get(url,  {headers: {
      "Authorization": "Bearer " + token
    }}).toPromise();
  }

}
