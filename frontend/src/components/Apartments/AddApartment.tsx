import {
    Button,
    DialogActionTrigger,
    DialogTitle,
    Input,
    Text,
    VStack,
    Grid,
    GridItem,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"

import { type ApartmentCreate, ApartmentsService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

const AddApartment = () => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<ApartmentCreate>({
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            address: "",
            city: "",
            area_sqm: undefined,
            rooms: undefined,
            floor: undefined,
            building_year: undefined,
            current_price: 0,
            description: "",
        },
    })

    const mutation = useMutation({
        mutationFn: (data: ApartmentCreate) =>
            ApartmentsService.createApartment({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Mieszkanie dodane pomyślnie.")
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

    const onSubmit: SubmitHandler<ApartmentCreate> = (data) => {
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
                <Button value="add-apartment" my={4}>
                    <FaPlus fontSize="16px" />
                    Dodaj Mieszkanie
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Dodaj Mieszkanie</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>Wypełnij szczegóły aby dodać nowe mieszkanie.</Text>
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
                        <DialogActionTrigger asChild>
                            <Button
                                variant="subtle"
                                colorPalette="gray"
                                disabled={isSubmitting}
                            >
                                Anuluj
                            </Button>
                        </DialogActionTrigger>
                        <Button
                            variant="solid"
                            type="submit"
                            disabled={!isValid}
                            loading={isSubmitting}
                        >
                            Zapisz
                        </Button>
                    </DialogFooter>
                </form>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}

export default AddApartment
