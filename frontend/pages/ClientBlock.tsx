import { useEffect, useState } from "react";
import { IconHome, IconArrowBack } from "@tabler/icons-react";
import dayjs from "dayjs";
import { getToken } from "../utils/auth";
import CardBlock from "@/components/ui/CardBlock";
import FormSection from "@/components/ui/FormSection";
import ActionButton from "@/components/ui/ActionButton";

interface PaymentBlock {
  id: string;
  paidAt: string;
  paidTrainings: number;
  used: number;
  pricePerBlock?: number;
  active: boolean;
}

export default function ClientBlock({
  onBack,
  onToProfile,
}: {
  onBack: () => void;
  onToProfile: () => void;
}) {
  const [block, setBlock] = useState<PaymentBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = getToken();

  useEffect(() => {
    const loadBlock = async () => {
      if (!token) {
        setBlock(null);
        setErrorMessage("Токен отсутствует. Повторите вход.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/api/payment-blocks/user/me/active`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (res.ok) {
          setBlock(data);
        } else {
          setBlock(null);
          setErrorMessage("У вас нет активного блока тренировок.");
        }
      } catch (error: any) {
        setBlock(null);
        setErrorMessage(error.message || "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    loadBlock();
  }, []);

  return (
    <div className="bg-white min-h-screen p-4 pb-28">
      <div className="max-w-sm mx-auto">
        <CardBlock>
          <FormSection title="📦 Блок тренировок">
            {loading ? (
              <div className="flex justify-center mt-4">
                <div className="w-5 h-5 border-2 border-[#f06595] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !block ? (
              <p className="text-center text-red-500 text-sm mt-4">
                ❌ {errorMessage || "У вас нет активного блока тренировок."}
              </p>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4 shadow-sm space-y-2 text-sm text-gray-700 mt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Дата оплаты:</span>
                  <span>{dayjs(block.paidAt).format("DD.MM.YYYY")}</span>
                </div>
                <div>
                  Всего тренировок:{" "}
                  <b className="text-gray-800">{block.paidTrainings}</b>
                </div>
                <div>
                  Использовано:{" "}
                  <b className="text-gray-800">{block.used}</b>
                </div>
                <div>
                  Осталось:{" "}
                  <b className="text-gray-800">
                    {block.paidTrainings - block.used}
                  </b>
                </div>
                {block.pricePerBlock !== undefined && (
                  <div>
                    Цена за блок:{" "}
                    <b className="text-gray-800">{block.pricePerBlock} ₽</b>
                  </div>
                )}
                <div
                  className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded ${
                    block.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {block.active ? "Активен" : "Завершён"}
                </div>
              </div>
            )}
          </FormSection>
        </CardBlock>

        <div className="fixed bottom-0 left-0 w-full bg-white py-5 px-4 shadow-md z-50">
          <div className="max-w-sm mx-auto flex flex-col gap-3">
            <ActionButton
              fullWidth
              variant="outline"
              leftIcon={<IconArrowBack size={16} />}
              onClick={onBack}
            >
              Назад
            </ActionButton>
            <ActionButton
              fullWidth
              variant="outline"
              leftIcon={<IconHome size={16} />}
              onClick={onToProfile}
            >
              На главную
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
