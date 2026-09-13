interface InstallmentFieldsProps {
    amount: number;
    installmentNumber: number;
}

export default function InstallmentFields({ amount, installmentNumber }: InstallmentFieldsProps) {
    return amount/installmentNumber;

}