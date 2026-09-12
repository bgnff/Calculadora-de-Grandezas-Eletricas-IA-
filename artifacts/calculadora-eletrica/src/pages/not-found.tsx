import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Página não encontrada</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            O endereço informado não corresponde a uma tela disponível.
          </p>
          <Link href="/" className="mt-5 inline-flex rounded-lg bg-[#1e6fff] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1557d6]">
            Voltar ao início
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
