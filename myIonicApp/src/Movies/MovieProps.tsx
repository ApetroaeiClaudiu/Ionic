export interface MovieProps {
    _id?: string;
    title:string;
    director:string;
    year:Date;
    treiD:boolean,
    price:number,
    userId:string,
    version:number,
    hasConflicts?:boolean,
    webViewPath: string;
    lat:number;
    lng:number;
  }
  