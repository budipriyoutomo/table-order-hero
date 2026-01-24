import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Lock, Loader2 } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const PinLogin = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setCurrentScreen, setIsAuthenticated, setCurrentUser } = useOrder();
  const { toast } = useToast();

  const handleLogin = async (pinValue: string) => {
    setIsLoading(true);
    setError(false);
    setErrorMessage(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('login-with-pin', {
        body: { pin: pinValue },
      });

      if (fnError) {
        console.error('Login function error:', fnError);
        setError(true);
        toast({
          title: 'Login gagal',
          description: 'Terjadi kesalahan saat menghubungi server',
          variant: 'destructive',
        });
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 600);
        return;
      }

      // Handle rate limiting
      if (data?.error === 'Too many requests') {
        setError(true);
        const retryAfter = data.retryAfter || 60;
        setErrorMessage(`Terlalu banyak percobaan. Coba lagi dalam ${retryAfter} detik.`);
        toast({
          title: 'Terlalu banyak percobaan',
          description: `Silakan tunggu ${retryAfter} detik`,
          variant: 'destructive',
        });
        setTimeout(() => {
          setPin('');
          setError(false);
          setErrorMessage(null);
        }, 3000);
        return;
      }

      // Handle lockout
      if (data?.error?.includes('temporarily locked')) {
        setError(true);
        const retryAfter = data.retryAfter || 120;
        setErrorMessage(`Akun terkunci sementara. Coba lagi dalam ${retryAfter} detik.`);
        toast({
          title: 'Akun terkunci',
          description: 'Terlalu banyak percobaan gagal',
          variant: 'destructive',
        });
        setTimeout(() => {
          setPin('');
          setError(false);
          setErrorMessage(null);
        }, 3000);
        return;
      }

      if (data?.success && data?.user) {
        // User object now only contains safe data (no credentials)
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        toast({
          title: `Selamat datang, ${data.user.full_name}!`,
          description: 'Login berhasil',
        });
        setTimeout(() => setCurrentScreen('tables'), 300);
      } else {
        setError(true);
        toast({
          title: 'PIN salah',
          description: 'Silakan coba lagi',
          variant: 'destructive',
        });
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 600);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(true);
      toast({
        title: 'Login gagal',
        description: 'Terjadi kesalahan jaringan',
        variant: 'destructive',
      });
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberPress = (num: string) => {
    if (pin.length < 6 && !isLoading) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      setErrorMessage(null);

      if (newPin.length === 6) {
        handleLogin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (!isLoading) {
      setPin((prev) => prev.slice(0, -1));
      setError(false);
      setErrorMessage(null);
    }
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
            whileHover={{ scale: 1.05 }}
          >
            {isLoading ? (
              <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
            ) : (
              <Lock className="w-10 h-10 text-primary-foreground" />
            )}
          </motion.div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2 text-foreground">
          Staff Login
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Enter your 6-digit PIN
        </p>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors ${
                error
                  ? 'border-destructive bg-destructive/10'
                  : pin.length > i
                  ? 'border-primary bg-primary/20'
                  : 'border-border bg-card'
              }`}
              animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <AnimatePresence mode="wait">
                {pin.length > i && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-3 h-3 rounded-full bg-primary"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-destructive text-center mb-4 text-sm"
            >
              {errorMessage || 'PIN salah. Silakan coba lagi.'}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Loading Message */}
        <AnimatePresence>
          {isLoading && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground text-center mb-4 text-sm"
            >
              Memverifikasi PIN...
            </motion.p>
          )}
        </AnimatePresence>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3">
          {numbers.map((num, i) => (
            <div key={i}>
              {num === '' ? (
                <div className="h-16" />
              ) : num === 'del' ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="w-full h-16 rounded-xl bg-secondary flex items-center justify-center touch-target transition-colors hover:bg-secondary/80 active:bg-secondary/60 disabled:opacity-50"
                >
                  <Delete className="w-6 h-6 text-secondary-foreground" />
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumberPress(num)}
                  disabled={isLoading}
                  className="w-full h-16 rounded-xl bg-card text-2xl font-semibold text-foreground touch-target transition-colors hover:bg-card-elevated active:bg-muted shadow-card disabled:opacity-50"
                >
                  {num}
                </motion.button>
              )}
            </div>
          ))}
        </div>

        {/* Demo hint */}
        <p className="text-muted-foreground text-center text-xs mt-8">
          Demo PIN: 220804
        </p>
      </motion.div>
    </div>
  );
};
