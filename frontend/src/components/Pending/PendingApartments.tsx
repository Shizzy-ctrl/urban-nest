import { Flex, Spinner } from "@chakra-ui/react"

const PendingApartments = () => {
    return (
        <Flex justify="center" align="center" height="50vh" width="full">
            <Spinner size="xl" color="ui.main" />
        </Flex>
    )
}

export default PendingApartments
