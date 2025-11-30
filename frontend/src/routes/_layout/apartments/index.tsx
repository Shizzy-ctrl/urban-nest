import {
    Container,
    EmptyState,
    Flex,
    Heading,
    Table,
    VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"
import { z } from "zod"

import { ApartmentsService } from "@/client"
import { ApartmentActionsMenu } from "@/components/Common/ApartmentActionsMenu"
import AddApartment from "@/components/Apartments/AddApartment"
import PendingApartments from "@/components/Pending/PendingApartments"
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from "@/components/ui/pagination.tsx"

const apartmentsSearchSchema = z.object({
    page: z.number().catch(1),
})

const PER_PAGE = 5

function getApartmentsQueryOptions({ page }: { page: number }) {
    return {
        queryFn: () =>
            ApartmentsService.readApartments({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
        queryKey: ["apartments", { page }],
    }
}

export const Route = createFileRoute("/_layout/apartments/")({
    component: Apartments,
    validateSearch: (search) => apartmentsSearchSchema.parse(search),
})

function ApartmentsTable() {
    const navigate = useNavigate({ from: Route.fullPath })
    const { page } = Route.useSearch()

    const { data, isLoading, isPlaceholderData } = useQuery({
        ...getApartmentsQueryOptions({ page }),
        placeholderData: (prevData) => prevData,
    })

    const setPage = (page: number) => {
        navigate({
            to: "/apartments",
            search: (prev) => ({ ...prev, page }),
        })
    }

    const apartments = data?.data.slice(0, PER_PAGE) ?? []
    const count = data?.count ?? 0

    if (isLoading) {
        return <PendingApartments />
    }

    if (apartments.length === 0) {
        return (
            <EmptyState.Root>
                <EmptyState.Content>
                    <EmptyState.Indicator>
                        <FiSearch />
                    </EmptyState.Indicator>
                    <VStack textAlign="center">
                        <EmptyState.Title>Nie masz jeszcze żadnych mieszkań</EmptyState.Title>
                        <EmptyState.Description>
                            Dodaj nowe mieszkanie aby zacząć
                        </EmptyState.Description>
                    </VStack>
                </EmptyState.Content>
            </EmptyState.Root>
        )
    }

    return (
        <>
            <Table.Root size={{ base: "sm", md: "md" }}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader w="md">Adres</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Miasto</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Pokoje</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Powierzchnia</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Cena</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Akcje</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {apartments?.map((apartment) => (
                        <Table.Row key={apartment.id} opacity={isPlaceholderData ? 0.5 : 1}>
                            <Table.Cell truncate maxW="md">
                                <a
                                    href={`/apartments/${apartment.id}`}
                                    style={{
                                        color: 'var(--chakra-colors-blue-600)',
                                        fontWeight: 'medium',
                                        cursor: 'pointer',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                >
                                    {apartment.address}
                                </a>
                            </Table.Cell>
                            <Table.Cell truncate maxW="sm">
                                {apartment.city}
                            </Table.Cell>
                            <Table.Cell>
                                {apartment.rooms || "N/A"}
                            </Table.Cell>
                            <Table.Cell>
                                {apartment.area_sqm ? `${apartment.area_sqm} m²` : "N/A"}
                            </Table.Cell>
                            <Table.Cell>
                                {new Intl.NumberFormat('pl-PL', {
                                    style: 'currency',
                                    currency: 'PLN',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(apartment.current_price)}
                            </Table.Cell>
                            <Table.Cell>
                                <ApartmentActionsMenu apartment={apartment} />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
            <Flex justifyContent="flex-end" mt={4}>
                <PaginationRoot
                    count={count}
                    pageSize={PER_PAGE}
                    onPageChange={({ page }) => setPage(page)}
                >
                    <Flex>
                        <PaginationPrevTrigger />
                        <PaginationItems />
                        <PaginationNextTrigger />
                    </Flex>
                </PaginationRoot>
            </Flex>
        </>
    )
}

function Apartments() {
    return (
        <Container maxW="full">
            <Heading size="lg" pt={12}>
                Zarządzanie Mieszkaniami
            </Heading>
            <AddApartment />
            <ApartmentsTable />
        </Container>
    )
}
