import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Music2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "Successfully logged in"
        });
        navigate("/home");
      } else {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            },
            emailRedirectTo: `${window.location.origin}/home`
          }
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-48 rounded-full gradient-primary opacity-20 blur-3xl" />
        <div className="absolute w-[500px] h-[500px] -bottom-48 -right-48 rounded-full gradient-primary opacity-20 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 glass-effect border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Music2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="px-[5px] py-[5px] rounded-md bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-medium text-3xl">
            {isLogin ? "Welcome Back" : "Join Musicals"}
          </CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to your account" : "Create your account to start"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Your username" value={username} onChange={e => setUsername(e.target.value)} required className="bg-secondary/50 border-primary/20 focus:border-primary" />
              </div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-secondary/50 border-primary/20 focus:border-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="bg-secondary/50 border-primary/20 focus:border-primary" />
            </div>
            <Button type="submit" className="w-full gradient-primary hover:opacity-90 transition-smooth shadow-glow" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Auth;