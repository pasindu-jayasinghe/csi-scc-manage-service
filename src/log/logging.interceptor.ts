import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '@nestjs/axios';


@Injectable()
export class LoggingInterceptor {

  auditlogURL = 'http://localhost:7000/audit';
  constructor(private httpService: HttpService){}

  intercept(context: ExecutionContext, next) {

    let action = context.getClass().name + "-" + context.getHandler().name;

    let req = context.switchToHttp().getRequest();
  
    let userName= req?.user?.username;
    let userId= req?.user?.id;
    let userType = req?.user?.roles
    let infor = JSON.stringify(req?.body);
    let description = req.url as string;
    let method =  req.method;

    if(userType){
      userType = userType.join(",")
    }

    if(method !== 'GET' && !description.includes("get") && !description.includes("/emission/cal")){
      let body = {
        action: action,
        infor: infor,
        description : description,
        userType : userType,
        userId: userId,
        userName: userName,
        method: method
      }
      this.log(body);      
    }
    
    return next
      .handle();
      // .pipe(
      //   tap(() => console.log(`After... ${Date.now() - now}ms`)),
      // );
  }


  log(body: any){
    try{
      this.httpService.post(this.auditlogURL, body).subscribe(rr => {}, er => console.log("log failed 1"))
    }catch(err){
      console.log("log failed ")
    }
  }
}
