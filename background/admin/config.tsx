import React from "react"
import { CustomNavigation } from './components/custom-navigation';
function CustomLogo() {
    return (<h3>Autop Blog</h3>)
}

export const components = {
    Logo: CustomLogo,
    Navigation: CustomNavigation

}

