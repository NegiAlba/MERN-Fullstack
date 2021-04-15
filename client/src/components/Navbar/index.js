
import React, { useState } from 'react'
import { Bars, Times, Nav, NavBtn, NavBtnLink, NavLink, NavMenu } from './NavbarElements'

const Navbar = () => {

    const [clicked,setClicked] = useState(false);

    const handleClick = (e) => {
        setClicked(!clicked);
    }

    return (
        <>
            <Nav>
                <NavLink to="/">
                    <h1>Logo</h1>
                </NavLink>
                {clicked ? <Times onClick={handleClick}/> : <Bars onClick={handleClick}/> }
                <NavMenu className={clicked ? 'responsive' : ''}>
                    <NavLink to ="/discover" activeStyle>
                        Discover
                    </NavLink>
                    <NavLink to ="/merch" activeStyle>
                        Merch
                    </NavLink>
                    <NavBtnLink to ="/signin">
                        Sign in
                    </NavBtnLink>
                </NavMenu>
                {/* <NavBtn>
                    <NavBtnLink to ="/signin">
                        Sign in
                    </NavBtnLink>
                </NavBtn> */}
            </Nav>
        </>
    )
}

export default Navbar
