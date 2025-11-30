import { Box, Flex, Image, useBreakpointValue } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"

import Logo from "/assets/images/urban-nest-logo.png"
import UserMenu from "./UserMenu"

function Navbar() {
  const display = useBreakpointValue({ base: "none", md: "flex" })

  return (
    <Flex
      display={display}
      justify="center"
      position="sticky"
      color="white"
      align="center"
      bg="bg.muted"
      w="100%"
      top={0}
      p={4}
      minH="80px"
    >
      <Link to="/">
        <Image src={Logo} alt="Logo" maxW="200px" />
      </Link>
      <Box position="absolute" right={4}>
        <UserMenu />
      </Box>
    </Flex>
  )
}

export default Navbar
