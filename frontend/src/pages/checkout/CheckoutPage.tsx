import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, CreditCard, Smartphone, ShieldCheck,
  CheckCircle2, Loader2, Lock, Star, Clock, Users, Award
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import { Badge } from '../../components/ui/badge'
import { useCourse } from '../../hooks/useCourses'
import { paymentApi } from '../../services/api'
import { cn } from '../../lib/utils'

type PaymentMethod = 'visa' | 'mastercard' | 'mobile_money' | 'orange_money'
type Step = 1 | 2 | 3

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { id: 'visa',         label: 'Visa / Mastercard', icon: '💳', desc: 'International bank card' },
  { id: 'mobile_money', label: 'MTN Mobile Money',  icon: '📱', desc: 'Pay via MTN Mobile Money' },
  { id: 'orange_money', label: 'Orange Money',       icon: '🟠', desc: 'Pay via Orange Money' },
]

const GRADIENTS = [
  'from-blue-700 to-blue-900',
  'from-amber-600 to-orange-800',
  'from-emerald-600 to-teal-800',
  'from-purple-600 to-violet-900',
  'from-rose-600 to-pink-800',
  'from-cyan-600 to-sky-800',
  'from-indigo-600 to-blue-900',
  'from-yellow-500 to-amber-700',
  'from-green-600 to-emerald-800',
  'from-red-600 to-rose-800',
]

export const CheckoutPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { data: course, isLoading } = useCourse(courseId ?? '')

  const [step, setStep] = useState<Step>(1)
  const [method, setMethod] = useState<PaymentMethod>('visa')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Card fields
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  // Mobile money
  const [phone, setPhone] = useState('')

  const gradient = GRADIENTS[(course?.gradientIndex ?? 0) % GRADIENTS.length]

  const handlePay = async () => {
    setError(null)
    // Basic validation
    if (method === 'visa' || method === 'mastercard') {
      if (!cardNumber || !cardName || !expiry || !cvv) {
        setError('Please fill in all card fields.')
        return
      }
    } else {
      if (!phone) {
        setError('Please enter your phone number.')
        return
      }
    }

    setLoading(true)
    try {
      // 1. Create the payment (PENDING)
      const payment = await paymentApi.checkout(course!.id)
      // 2. Confirm immediately (local simulation) → triggers enrollment
      await paymentApi.confirm(payment.id)
      setOrderId(payment.id)
      setStep(3)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)

  const formatExpiry = (v: string) =>
    v.replace(/\D/g, '').replace(/^(\d{2})/, '$1/').slice(0, 5)

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  // Step 3 — Success
  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Enrollment confirmed!</h1>
          <p className="text-muted-foreground">
            Your payment has been recorded. You can now access your course.
          </p>
        </div>
        <Card>
          <CardContent className="p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Course</span>
              <span className="font-medium text-right max-w-48 line-clamp-1">{course.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-foreground">{course.price}€</span>
            </div>
            {orderId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs text-muted-foreground">{orderId.slice(0, 8).toUpperCase()}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/dashboard">
            <Button className="gap-2">
              <Award className="h-4 w-4" /> My Student Space
            </Button>
          </Link>
          <Link to="/catalogue">
            <Button variant="outline" className="gap-2">
              Keep exploring
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Back */}
      <button
        onClick={() => step === 1 ? navigate(-1) : setStep(s => (s - 1) as Step)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {step === 1 ? 'Back to course' : 'Previous step'}
      </button>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: 'Summary' },
          { n: 2, label: 'Payment' },
          { n: 3, label: 'Confirmation' },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0 transition-colors",
              step === n ? "bg-primary text-primary-foreground" :
              step > n  ? "bg-emerald-500 text-white" :
              "bg-muted text-muted-foreground"
            )}>
              {step > n ? <CheckCircle2 className="h-4 w-4" /> : n}
            </div>
            <span className={cn(
              "text-sm font-medium whitespace-nowrap",
              step === n ? "text-foreground" : "text-muted-foreground"
            )}>{label}</span>
            {i < 2 && <div className="flex-1 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Main ── */}
        <div className="lg:col-span-2 space-y-6">

          {step === 1 && (
            <>
              <h2 className="text-xl font-bold">Order Summary</h2>
              <Card>
                <CardContent className="p-0 overflow-hidden rounded-xl">
                  <div className={`bg-gradient-to-br ${gradient} h-28 flex items-center justify-center`}>
                    <span className="text-5xl font-black text-white/20 select-none">
                      {course.title.charAt(0)}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <Badge variant="outline" className="text-[10px] mb-1.5">{course.level}</Badge>
                      <h3 className="font-semibold text-base">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{course.filiere}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {course.rating?.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {course.studentsCount?.toLocaleString()} enrolled
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {course.durationHours}h
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold">What's included</h3>
                  {[
                    `${course.durationHours}h of HD video content`,
                    'Lifetime access on all platforms',
                    `Official ZMA certificate (${course.ects ?? 0} ECTS)`,
                    'Downloadable learning resources',
                    'Access to the learner community',
                    '30-day money-back guarantee',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button size="lg" className="w-full gap-2" onClick={() => setStep(2)}>
                Continue to payment <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold">Choose your payment method</h2>

              {/* Payment method selector */}
              <div className="grid grid-cols-1 gap-3">
                {PAYMENT_METHODS.map(({ id, label, icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setMethod(id)}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
                      method === id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <div className={cn(
                      "ml-auto h-5 w-5 rounded-full border-2 transition-colors shrink-0",
                      method === id ? "border-primary bg-primary" : "border-muted-foreground"
                    )}>
                      {method === id && <div className="h-full w-full rounded-full bg-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>}
                    </div>
                  </button>
                ))}
              </div>

              {/* Payment form */}
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">Secure payment — 256-bit SSL</span>
                  </div>

                  {(method === 'visa' || method === 'mastercard') ? (
                    <>
                      <div className="space-y-1.5">
                        <Label>Name on card</Label>
                        <Input
                          placeholder="JOHN DOE"
                          value={cardName}
                          onChange={e => setCardName(e.target.value.toUpperCase())}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Card number</Label>
                        <div className="relative">
                          <Input
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={e => setCardNumber(formatCard(e.target.value))}
                            maxLength={19}
                            className="pr-10"
                          />
                          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Expiry date</Label>
                          <Input
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={e => setExpiry(formatExpiry(e.target.value))}
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>CVV</Label>
                          <Input
                            placeholder="123"
                            value={cvv}
                            onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            type="password"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1.5">
                      <Label>
                        Phone number{' '}
                        {method === 'mobile_money' ? '(MTN)' : '(Orange)'}
                      </Label>
                      <div className="relative">
                        <Input
                          placeholder={method === 'mobile_money' ? '6XXXXXXXX' : '6XXXXXXXX'}
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                          className="pl-14"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                          +237
                        </span>
                        <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You'll receive a notification on your phone to confirm the payment.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="w-full gap-2 font-semibold"
                onClick={handlePay}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                  : <><ShieldCheck className="h-4 w-4" /> Confirm payment — {course.price}€</>
                }
              </Button>
            </>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-sm">Summary</h3>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course price</span>
                  <span>{course.price}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-emerald-600">—</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-lg">{course.price}€</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>30-day money-back guarantee — no questions asked.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                <Lock className="h-4 w-4 text-primary shrink-0" />
                <span>Secure payment — your data is protected.</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
