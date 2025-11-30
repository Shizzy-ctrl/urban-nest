import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    Grid,
    Card,
    Flex,
    Badge,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { FiClock, FiDollarSign, FiEdit } from "react-icons/fi"

import { ApartmentsService } from "@/client"
import EditApartment from "@/components/Apartments/EditApartment"
import UpdatePrice from "@/components/Apartments/UpdatePrice"
import DeleteApartment from "@/components/Apartments/DeleteApartment"

export const Route = createFileRoute("/_layout/apartments/$apartmentId")({
    component: ApartmentDetail,
    validateSearch: () => ({}), // No search params needed for detail page
})

function ApartmentDetail() {
    const { apartmentId } = Route.useParams()

    const { data: apartment, isLoading } = useQuery({
        queryKey: ["apartment", apartmentId],
        queryFn: () => ApartmentsService.readApartment({ id: apartmentId }),
    })

    const { data: apartmentWithHistory } = useQuery({
        queryKey: ["apartment-history", apartmentId],
        queryFn: () => ApartmentsService.readApartmentWithHistory({ id: apartmentId }),
    })

    if (isLoading || !apartment) {
        return <Container maxW="full">Ładowanie...</Container>
    }

    return (
        <Container maxW="full" py={8}>
            <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <Heading size="lg">{apartment.address}</Heading>
                <Flex gap={2}>
                    <EditApartment apartment={apartment} />
                    <UpdatePrice apartment={apartment} />
                    <DeleteApartment id={apartment.id} />
                </Flex>
            </Flex>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={8}>
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Szczegóły Mieszkania</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <VStack align="stretch" gap={3}>
                            <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.500">Miasto</Text>
                                <Text>{apartment.city}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.500">Powierzchnia</Text>
                                <Text>{apartment.area_sqm ? `${apartment.area_sqm} m²` : "N/A"}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.500">Liczba pokoi</Text>
                                <Text>{apartment.rooms || "N/A"}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.500">Piętro</Text>
                                <Text>{apartment.floor !== null ? apartment.floor : "N/A"}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.500">Rok budowy</Text>
                                <Text>{apartment.building_year || "N/A"}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.500">Obecna cena</Text>
                                <Text fontSize="xl" fontWeight="bold" color="green.600">
                                    {new Intl.NumberFormat('pl-PL', {
                                        style: 'currency',
                                        currency: 'PLN',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(apartment.current_price)}
                                </Text>
                            </Box>
                            {apartment.description && (
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500">Opis</Text>
                                    <Text>{apartment.description}</Text>
                                </Box>
                            )}
                        </VStack>
                    </Card.Body>
                </Card.Root>

                <Card.Root>
                    <Card.Header>
                        <Card.Title>
                            <Flex align="center" gap={2}>
                                <FiDollarSign />
                                Historia Cen
                            </Flex>
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        {apartmentWithHistory?.price_history && apartmentWithHistory.price_history.length > 0 ? (
                            <VStack align="stretch" gap={3}>
                                {apartmentWithHistory.price_history.map((change) => (
                                    <Box key={change.id} p={3} borderWidth="1px" borderRadius="md">
                                        <Flex justifyContent="space-between" mb={2}>
                                            <Text fontSize="sm" color="gray.500">
                                                <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                                                {new Date(change.changed_at).toLocaleString('pl-PL')}
                                            </Text>
                                        </Flex>
                                        <Flex gap={2} alignItems="center">
                                            <Text textDecoration="line-through" color="red.500">
                                                {new Intl.NumberFormat('pl-PL', {
                                                    style: 'currency',
                                                    currency: 'PLN',
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0
                                                }).format(change.old_price)}
                                            </Text>
                                            <Text>→</Text>
                                            <Text fontWeight="bold" color="green.600">
                                                {new Intl.NumberFormat('pl-PL', {
                                                    style: 'currency',
                                                    currency: 'PLN',
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0
                                                }).format(change.new_price)}
                                            </Text>
                                        </Flex>
                                    </Box>
                                ))}
                            </VStack>
                        ) : (
                            <Text color="gray.500">Brak historii zmian cen</Text>
                        )}
                    </Card.Body>
                </Card.Root>
            </Grid>

            <Card.Root>
                <Card.Header>
                    <Card.Title>
                        <Flex align="center" gap={2}>
                            <FiEdit />
                            Historia Wszystkich Zmian
                        </Flex>
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    {apartmentWithHistory?.change_history && apartmentWithHistory.change_history.length > 0 ? (
                        <VStack align="stretch" gap={3}>
                            {apartmentWithHistory.change_history.map((change) => (
                                <Box key={change.id} p={3} borderWidth="1px" borderRadius="md">
                                    <Flex justifyContent="space-between" mb={2}>
                                        <Badge colorPalette="blue">{change.field_name}</Badge>
                                        <Text fontSize="sm" color="gray.500">
                                            <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                                            {new Date(change.changed_at).toLocaleString('pl-PL')}
                                        </Text>
                                    </Flex>
                                    <Flex gap={2} alignItems="center" flexWrap="wrap">
                                        {change.old_value && (
                                            <Text textDecoration="line-through" color="red.500">
                                                {change.old_value}
                                            </Text>
                                        )}
                                        {change.old_value && <Text>→</Text>}
                                        <Text fontWeight="bold" color="green.600">
                                            {change.new_value || "(puste)"}
                                        </Text>
                                    </Flex>
                                </Box>
                            ))}
                        </VStack>
                    ) : (
                        <Text color="gray.500">Brak historii zmian</Text>
                    )}
                </Card.Body>
            </Card.Root>
        </Container>
    )
}
