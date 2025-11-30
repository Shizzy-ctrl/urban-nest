import {
    Button,
    ButtonGroup,
    DialogActionTrigger,
    Input,
    Text,
    VStack,
    Grid,
    GridItem,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaEdit } from "react-icons/fa"

import { type ApiError, type ApartmentPublic, ApartmentsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface EditApartmentProps {
    apartment: ApartmentPublic
}

interface ApartmentUpdateForm {
    address: string
    city: string
    area_sqm?: number | null
    rooms?: number | null
    floor?: number | null
    building_year?: number | null
    current_price: number
    description?: string | null
}

const EditApartment = ({ apartment }: EditApartmentProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ApartmentUpdateForm>({
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            address: apartment.address,
            city: apartment.city,
            area_sqm: apartment.area_sqm ?? undefined,
            rooms: apartment.rooms ?? undefined,
            floor: apartment.floor ?? undefined,
            building_year: apartment.building_year ?? undefined,
            current_price: apartment.current_price,
            description: apartment.description ?? undefined,
        },
    })

    const mutation = useMutation({
        mutationFn: (data: ApartmentUpdateForm) =>
            ApartmentsService.updateApartmentEndpoint({ id: apartment.id, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Mieszkanie zaktualizowane pomyślnie.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["apartments"] })
        },
    })

    const onSubmit: SubmitHandler<ApartmentUpdateForm> = async (data) => {
        mutation.mutate(data)
    }

    return (
        <DialogRoot
            size={{ base: "xs", md: "lg" }}
            placement="center"
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}
        >
            <DialogTrigger asChild>
                <Button variant="ghost">
                    <FaEdit fontSize="16px" />
                    Edytuj
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edytuj Mieszkanie</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>Zaktualizuj szczegóły mieszkania.</Text>
                        <VStack gap={4}>
                            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                                <GridItem colSpan={2}>
                                    <Field
                                        required
                                        invalid={!!errors.address}
                                        errorText={errors.address?.message}
                                        label="Adres"
                                    >
                                        <Input
                                            {...register("address", {
                                                required: "Adres jest wymagany.",
                                            })}
                                            placeholder="ul. Przykładowa 123"
                                            type="text"
                                        />
                                    </Field>
                                </GridItem>

                                <GridItem colSpan={2}>
                                    <Field
                                        required
                                        invalid={!!errors.city}
                                        errorText={errors.city?.message}
                                        label="Miasto"
                                    >
                                        <Input
                                            {...register("city", {
                                                required: "Miasto jest wymagane.",
                                            })}
                                            placeholder="Warszawa"
                                            type="text"
                                        />
                                    </Field>
                                </GridItem>

                                <GridItem>
                                    <Field
                                        invalid={!!errors.area_sqm}
                                        errorText={errors.area_sqm?.message}
                                        label="Powierzchnia (m²)"
                                    >
                                        <Input
                                            {...register("area_sqm", {
                                                valueAsNumber: true,
                                                min: { value: 0, message: "Powierzchnia musi być większa niż 0" },
                                            })}
                                            placeholder="50"
                                            type="number"
                                            step="0.01"
                                        />
                                    </Field>
                                </GridItem>

                                <GridItem>
                                    <Field
                                        invalid={!!errors.rooms}
                                        errorText={errors.rooms?.message}
                                        label="Liczba pokoi"
                                    >
                                        <Input
                                            {...register("rooms", {
                                                valueAsNumber: true,
                                                min: { value: 1, message: "Minimum 1 pokój" },
                                            })}
                                            placeholder="2"
                                            type="number"
                                        />
                                    </Field>
                                </GridItem>

                                <GridItem>
                                    <Field
                                        invalid={!!errors.floor}
                                        errorText={errors.floor?.message}
                                        label="Piętro"
                                    >
                                        <Input
                                            {...register("floor", {
                                                valueAsNumber: true,
                                            })}
                                            placeholder="3"
                                            type="number"
                                        />
                                    </Field>
                                </GridItem>

                                <GridItem>
                                    <Field
                                        invalid={!!errors.building_year}
                                        errorText={errors.building_year?.message}
                                        label="Rok budowy"
                                    >
                                        <Input
                                            {...register("building_year", {
                                                valueAsNumber: true,
                                                min: { value: 1800, message: "Rok musi być po 1800" },
                                                max: { value: 2100, message: "Rok musi być przed 2100" },
                                            })}
                                            placeholder="2010"
                                            type="number"
                                        />
                                    </Field>
                                </GridItem>

                                <GridItem colSpan={2}>
                                    <Field
                                        required
                                        invalid={!!errors.current_price}
                                        errorText={errors.current_price?.message}
                                        label="Cena (PLN)"
                                    >
                                        <Input
                                            {...register("current_price", {
                                                required: "Cena jest wymagana.",
                                                valueAsNumber: true,
                                                min: { value: 0, message: "Cena musi być większa niż 0" },
                                            })}
                                            placeholder="500000"
                                            type="number"
                                            step="0.01"
                                        />
                                    </Field>
                                </GridItem>

                                <GridItem colSpan={2}>
                                    <Field
                                        invalid={!!errors.description}
                                        errorText={errors.description?.message}
                                        label="Opis"
                                    >
                                        <Input
                                            {...register("description")}
                                            placeholder="Dodatkowe informacje..."
                                            type="text"
                                        />
                                    </Field>
                                </GridItem>
                            </Grid>
                        </VStack>
                    </DialogBody>

                    <DialogFooter gap={2}>
                        <ButtonGroup>
                            <DialogActionTrigger asChild>
                                <Button
                                    variant="subtle"
                                    colorPalette="gray"
                                    disabled={isSubmitting}
                                >
                                    Anuluj
                                </Button>
                            </DialogActionTrigger>
                            <Button variant="solid" type="submit" loading={isSubmitting}>
                                Zapisz
                            </Button>
                        </ButtonGroup>
                    </DialogFooter>
                </form>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}

export default EditApartment
