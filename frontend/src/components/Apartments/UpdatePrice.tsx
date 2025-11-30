import {
    Button,
    ButtonGroup,
    DialogActionTrigger,
    Input,
    Text,
    VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaDollarSign } from "react-icons/fa"

import { type ApiError, type ApartmentPublic, ApartmentsService, type PriceUpdate } from "@/client"
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

interface UpdatePriceProps {
    apartment: ApartmentPublic
}

const UpdatePrice = ({ apartment }: UpdatePriceProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PriceUpdate>({
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            new_price: apartment.current_price,
        },
    })

    const mutation = useMutation({
        mutationFn: (data: PriceUpdate) =>
            ApartmentsService.updatePrice({ id: apartment.id, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Cena zaktualizowana pomyślnie.")
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

    const onSubmit: SubmitHandler<PriceUpdate> = async (data) => {
        mutation.mutate(data)
    }

    return (
        <DialogRoot
            size={{ base: "xs", md: "md" }}
            placement="center"
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}
        >
            <DialogTrigger asChild>
                <Button variant="ghost">
                    <FaDollarSign fontSize="16px" />
                    Aktualizuj Cenę
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Aktualizuj Cenę</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>
                            Obecna cena: {new Intl.NumberFormat('pl-PL', {
                                style: 'currency',
                                currency: 'PLN',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(apartment.current_price)}
                        </Text>
                        <VStack gap={4}>
                            <Field
                                required
                                invalid={!!errors.new_price}
                                errorText={errors.new_price?.message}
                                label="Nowa Cena (PLN)"
                            >
                                <Input
                                    {...register("new_price", {
                                        required: "Cena jest wymagana.",
                                        valueAsNumber: true,
                                        min: { value: 0, message: "Cena musi być większa niż 0" },
                                    })}
                                    placeholder="500000"
                                    type="number"
                                    step="0.01"
                                />
                            </Field>
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
                                Aktualizuj
                            </Button>
                        </ButtonGroup>
                    </DialogFooter>
                </form>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}

export default UpdatePrice
