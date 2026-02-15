import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    Timestamp,
    where,
} from "firebase/firestore";
import { AlertCircle, Check, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebase";

interface CertificatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onSuccess?: () => void;
}

type PaymentMethod = "m-pesa" | "e-mola" | "bank";
type CertificateStatus = "pending" | "confirmed" | "rejected";

export interface Certificate {
  id?: string;
  student_uid: string;
  student_name: string;
  course_id: string;
  course_title: string;
  status: CertificateStatus;
  payment_method: PaymentMethod;
  transaction_id: string;
  submitted_at: Timestamp;
  confirmed_at?: Timestamp;
  rejection_reason?: string;
  instructor_uid?: string;
}

const CertificatePaymentModal: React.FC<CertificatePaymentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  onSuccess,
}) => {
  const { user, profile } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("m-pesa");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingCertificate, setExistingCertificate] =
    useState<Certificate | null>(null);
  const [instructorUid, setInstructorUid] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      checkExistingCertificate();
      getInstructorUid();
    }
  }, [isOpen, user, courseId]);

  const getInstructorUid = async () => {
    try {
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        const courseData = courseSnap.data();
        setInstructorUid(courseData?.instructor_uid || null);
      }
    } catch (err) {
      console.error("Erro ao buscar instrutor do curso:", err);
    }
  };

  const checkExistingCertificate = async () => {
    if (!user) return;

    try {
      const certificatesRef = collection(db, "certificates");
      const q = query(
        certificatesRef,
        where("student_uid", "==", user.uid),
        where("course_id", "==", courseId),
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setExistingCertificate(snapshot.docs[0].data() as Certificate);
      } else {
        setExistingCertificate(null);
      }
    } catch (err) {
      console.error("Erro ao verificar certificado existente:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      setError("Por favor, insira o ID da transação");
      return;
    }

    if (!user || !profile) {
      setError("Utilizador não autenticado");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const certificatesRef = collection(db, "certificates");

      const newCertificate: Certificate = {
        student_uid: user.uid,
        student_name: profile.full_name || profile.name || "Estudante",
        course_id: courseId,
        course_title: courseTitle,
        status: "pending",
        payment_method: paymentMethod,
        transaction_id: transactionId,
        submitted_at: Timestamp.now(),
        instructor_uid: instructorUid || undefined,
      };

      await addDoc(certificatesRef, newCertificate);

      setSuccess(true);
      setTransactionId("");
      setPaymentMethod("m-pesa");

      // Chamar onSuccess callback após 1.5s
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Erro ao submeter certificado:", err);
      setError("Erro ao submeter dados de pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError("");
    setTransactionId("");
    setPaymentMethod("m-pesa");
    onClose();
  };

  if (!isOpen) return null;

  // Se existe certificado confirmado, mostrar mensagem de sucesso
  if (existingCertificate?.status === "confirmed") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Certificado Confirmado
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Seu certificado foi verificado e confirmado pelo instrutor. Já pode
            fazer download.
          </p>
          <button
            onClick={handleClose}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Se existe certificado pendente ou rejeitado, mostrar status
  if (existingCertificate) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-4">
            {existingCertificate.status === "pending" && (
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    À Espera de Confirmação
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Seu pedido de certificado foi recebido em{" "}
                    {existingCertificate.submitted_at
                      ?.toDate?.()
                      .toLocaleDateString("pt-PT")}
                    . O instrutor em breve confirmará.
                  </p>
                </div>
              </div>
            )}

            {existingCertificate.status === "rejected" && (
              <div className="flex items-start">
                <X className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Certificado Rejeitado
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {existingCertificate.rejection_reason ||
                      "O instrutor rejeitou seu pedido de certificado."}
                  </p>
                  <button
                    onClick={() => {
                      setExistingCertificate(null);
                      setTransactionId("");
                    }}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Método de Pagamento:{" "}
              <span className="font-medium">
                {existingCertificate.payment_method.toUpperCase()}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ID da Transação:{" "}
              <span className="font-medium">
                {existingCertificate.transaction_id}
              </span>
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-full mt-6 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Emitir Certificado
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Para receber seu certificado de <strong>{courseTitle}</strong>,
          confirme seu pagamento abaixo.
        </p>

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900">
                Enviado com Sucesso!
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Seus dados de pagamento foram recebidos. O instrutor confirmará
                em breve.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="m-pesa">M-Pesa</option>
              <option value="e-mola">E-Mola</option>
              <option value="bank">Transferência Bancária</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID da Transação
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              disabled={loading || success}
              placeholder="Ex: TRX123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Cole o ID ou número de referência da sua transação
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Nota:</strong> Certifique-se de que o pagamento foi
              processado antes de enviar os dados. O instrutor confirmará seu
              pagamento antes de liberar o certificado.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
          >
            {loading
              ? "Enviando..."
              : success
                ? "✓ Enviado"
                : "Enviar Dados de Pagamento"}
          </button>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="w-full text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CertificatePaymentModal;
