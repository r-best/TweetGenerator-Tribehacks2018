import { Injectable } from '@angular/core';

@Injectable()
export class ToastService {

    constructor() { }
  
    showToast(alertClass: string, text: string){
        var toast = document.getElementById(`toast`);
        // if(!toast.className.includes(`show`)){
            toast.textContent = text;
            toast.className = `alert ${alertClass} show`;
            setTimeout(() => {toast.className = toast.className.replace(` show`, ``)}, 3000);
        // }
    }
}