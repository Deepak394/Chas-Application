import { Children, createContext, useState } from "react";

const  UserType = createContext<any>(null);
//@ts-ignore
const UserContext = ({children}) => {
    const [userId, setUserId] = useState()
    return (
        <UserType.Provider value={{userId,setUserId}}>
            {children}
        </UserType.Provider>

    )
}
export {UserType, UserContext}