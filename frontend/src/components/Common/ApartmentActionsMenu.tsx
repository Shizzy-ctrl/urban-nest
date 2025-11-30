import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@chakra-ui/react"
import { FiMoreVertical } from "react-icons/fi"

import type { ApartmentPublic } from "@/client"
import { Button } from "../ui/button"
import DeleteApartment from "../Apartments/DeleteApartment"
import EditApartment from "../Apartments/EditApartment"
import UpdatePrice from "../Apartments/UpdatePrice"

interface ApartmentActionsMenuProps {
    apartment: ApartmentPublic
}

export const ApartmentActionsMenu = ({ apartment }: ApartmentActionsMenuProps) => {
    return (
        <MenuRoot>
            <MenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <FiMoreVertical />
                </Button>
            </MenuTrigger>
            <MenuContent>
                <MenuItem value="edit" asChild>
                    <EditApartment apartment={apartment} />
                </MenuItem>
                <MenuItem value="update-price" asChild>
                    <UpdatePrice apartment={apartment} />
                </MenuItem>
                <MenuItem value="delete" asChild>
                    <DeleteApartment id={apartment.id} />
                </MenuItem>
            </MenuContent>
        </MenuRoot>
    )
}
