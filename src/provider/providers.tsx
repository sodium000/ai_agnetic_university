"use client"



import { ReactNode } from "react";
import QueryProvider from "./queryProvider";

 export default function Providers ({children}:{children : ReactNode}){

    return (
        <QueryProvider>
            {children}
        </QueryProvider>
    )

}

