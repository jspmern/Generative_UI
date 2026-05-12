export type streamMessage= | 
    {type:'ai',
        payload:{text:string}
    }
    | {
        type:'toolCall',
        payload:{name:string,args:Record<string,any>}
    }
    | {
        type:'toolResult',
        payload:{name:string,result:Record<string,any>}
    }
