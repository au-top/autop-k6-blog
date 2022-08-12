import type { NavigationProps } from '@keystone-6/core/admin-ui/components';
import { NavigationContainer, NavItem, ListNavItems } from '@keystone-6/core/admin-ui/components';
import React from 'react';
export function CustomNavigation({ authenticatedItem, lists }: NavigationProps) {
    return (
        <NavigationContainer authenticatedItem={authenticatedItem}>
            <ListNavItems lists={lists} />
        </NavigationContainer>
    )
}
