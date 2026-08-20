import { useState, useMemo } from 'react';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { useRouter } from '@/store/router';
import { getProductById, promoCodes } from '@/data/products';
import { OrderSummary, calculateTotal } from '@/components/OrderSummary';
import { saveOrder } from '@/services/orders';
import {
  formatCardNumber, formatExpiry, detectCardBrand,
  isValidEmail, isValidPhone, isValidCardNumber, isValidExpiry, isValidCvv,
  shippingCost, shippingLabel, shippingDays, taxRate, addDays,
} from '@/utils/helpers';
import { useCurrency } from '@/store/currency';
import type {
  ContactInfo, ShippingAddress, ShippingMethod, PaymentInfo, PaymentMethod,
  PromoCode, OrderItem,
} from '@/types';
import {
  ArrowRight, ArrowLeft, Check, Lock, Shield, Truck, Zap, Clock,
  CreditCard, Wallet, Apple, ChevronDown, AlertCircle, Loader2,
  Package, MapPin, Mail, User as UserIcon,
} from 'lucide-react';

type Step = 'information' | 'shipping' | 'payment' | 'review';
type PlaceOrderState = 'idle' | 'processing' | 'success' | 'error';

const STEPS: { id: Step; label: string; num: string }[] = [
  { id: 'information', label: 'Information', num: '01' },
  { id: 'shipping', label: 'Shipping', num: '02' },
  { id: 'payment', label: 'Payment', num: '03' },
  { id: 'review', label: 'Review', num: '04' },
];

export function CheckoutPage() {
  const { activeCartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { navigate } = useRouter();
  const { formatPrice } = useCurrency();

  const [step, setStep] = useState<Step>('information');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const [contact, setContact] = useState<ContactInfo>({
    email: user?.email ?? '',
    phone: '',
    subscribe: true,
  });

  const [shipping, setShipping] = useState<ShippingAddress>({
    firstName: user?.user_metadata?.full_name?.split(' ')[0] ?? '',
    lastName: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') ?? '',
    country: 'United States',
    state: 'CA',
    city: '',
    address: '',
    apt: '',
    postal: '',
    phone: '',
  });

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [saveAddress, setSaveAddress] = useState(true);

  const [payment, setPayment] = useState<PaymentInfo>({
    method: 'card',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    billingSameAsShipping: true,
    billingAddress: null,
  });

  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    firstName: '', lastName: '', country: 'United States', state: '', city: '', address: '', apt: '', postal: '', phone: '',
  });

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderState, setOrderState] = useState<PlaceOrderState>('idle');
  const [processingStep, setProcessingStep] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const subtotal = useMemo(() => {
    return activeCartItems.reduce((sum, item) => {
      const product = getProductById(item.productId);
      return product ? sum + product.price * item.quantity : sum;
    }, 0);
  }, [activeCartItems]);

  const discount = appliedPromo
    ? appliedPromo.type === 'percent' ? (subtotal * appliedPromo.value) / 100 : appliedPromo.value
    : 0;

  const { shipping: shippingCharge, tax, total } = calculateTotal(subtotal, discount, shippingMethod, shipping.state);

  const cardBrand = detectCardBrand(payment.cardNumber);

  // Empty cart guard
  if (activeCartItems.length === 0 && orderState !== 'processing') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-20 text-center animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-800 animate-scale-in neon-glow">
          <Package className="h-8 w-8 text-ink-500" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink-100">Your bag is empty</h1>
        <p className="mt-2 text-ink-400">Add some sneakers before checking out.</p>
        <button onClick={() => navigate('/shop')} className="mt-6 rounded-full bg-accent-400 px-6 py-3 text-sm font-bold text-ink-950 transition-all duration-300 hover:scale-105 neon-glow">
          EXPLORE SNEAKERS
        </button>
      </div>
    );
  }

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const promo = promoCodes.find((p) => p.code === code);
    if (promo) {
      setAppliedPromo(promo);
      setPromoError(null);
      const saved = promo.type === 'percent' ? (subtotal * promo.value) / 100 : promo.value;
      setPromoSuccess(`Promo code applied — You saved ${formatPrice(saved)}`);
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code. Try SNEAK10, WELCOME15, or FUTURE20.');
      setPromoSuccess(null);
    }
  };

  const validateInformation = (): boolean => {
    const e: Record<string, string> = {};
    if (!isValidEmail(contact.email)) e.email = 'Please enter a valid email address.';
    if (!isValidPhone(contact.phone)) e.contactPhone = 'Please enter a valid phone number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateShipping = (): boolean => {
    const e: Record<string, string> = {};
    if (!shipping.firstName.trim()) e.firstName = 'Please enter your first name.';
    if (!shipping.lastName.trim()) e.lastName = 'Please enter your last name.';
    if (!shipping.address.trim()) e.address = 'Please enter your delivery address.';
    if (!shipping.city.trim()) e.city = 'Please enter your city.';
    if (!shipping.state.trim()) e.state = 'Please enter your state or province.';
    if (!shipping.postal.trim()) e.postal = 'Please enter your postal code.';
    if (!isValidPhone(shipping.phone)) e.shippingPhone = 'Please enter a valid phone number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = (): boolean => {
    if (payment.method !== 'card') return true;
    const e: Record<string, string> = {};
    if (!payment.cardName.trim()) e.cardName = 'Please enter the cardholder name.';
    if (!isValidCardNumber(payment.cardNumber)) e.cardNumber = 'Please check your card details.';
    if (!isValidExpiry(payment.cardExpiry)) e.cardExpiry = 'Please check the expiry date.';
    if (!isValidCvv(payment.cardCvv)) e.cardCvv = 'Please check your CVV.';
    if (!payment.billingSameAsShipping) {
      if (!billingAddress.address.trim()) e.billAddress = 'Please enter billing address.';
      if (!billingAddress.city.trim()) e.billCity = 'Please enter billing city.';
      if (!billingAddress.postal.trim()) e.billPostal = 'Please enter billing postal code.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === 'information') {
      if (validateInformation()) setStep('shipping');
    } else if (step === 'shipping') {
      if (validateShipping()) setStep('payment');
    } else if (step === 'payment') {
      if (validatePayment()) setStep('review');
    }
  };

  const goBack = () => {
    if (step === 'shipping') setStep('information');
    else if (step === 'payment') setStep('shipping');
    else if (step === 'review') setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!agreeTerms) return;
    if (orderState === 'processing') return;

    // Final validation
    if (!validateInformation() || !validateShipping() || !validatePayment()) {
      setStep('information');
      return;
    }

    setOrderState('processing');
    setProcessingStep(0);

    const steps = ['Verifying details', 'Securing payment', 'Confirming inventory', 'Preparing your order', 'Order confirmed'];
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise((r) => setTimeout(r, 700));
    }

    try {
      const orderItems: OrderItem[] = activeCartItems.map((item) => {
        const product = getProductById(item.productId)!;
        const color = product.colors.find((c) => c.id === item.colorId)!;
        return {
          productId: product.id,
          name: product.name,
          colorName: color.name,
          colorHex: color.hex,
          sizeEu: item.sizeEu,
          quantity: item.quantity,
          price: product.price,
          image: color.image,
        };
      });

      const cardLast4 = payment.method === 'card'
        ? payment.cardNumber.replace(/\s/g, '').slice(-4)
        : '';

      const order = await saveOrder({
        customerId: user?.id ?? null,
        contact,
        shippingAddress: shipping,
        shippingMethod,
        payment: { method: payment.method, cardLast4 },
        items: orderItems,
        subtotal,
        discount,
        promoCode: appliedPromo?.code ?? null,
        shippingCost: shippingCharge,
        tax,
        total,
        paymentStatus: 'demo',
      }, user?.id ?? null);

      clearCart();
      setOrderState('success');
      navigate(`/confirmation/${order.id}`);
    } catch (err) {
      console.error('Order failed:', err);
      setOrderState('error');
    }
  };

  const currentStepIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="pt-24 aurora-bg">
      {orderState === 'processing' && <ProcessingOverlay step={processingStep} />}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-1 items-center gap-1 sm:gap-2">
                <button
                  onClick={() => i < currentStepIdx && setStep(s.id)}
                  disabled={i > currentStepIdx}
                  className="flex items-center gap-2"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shrink-0 ${
                    i < currentStepIdx ? 'bg-accent-400 text-ink-950' :
                    i === currentStepIdx ? 'bg-accent-400 text-ink-950 ring-4 ring-accent-400/20' :
                    'bg-ink-800 text-ink-500'
                  }`}>
                    {i < currentStepIdx ? <Check className="h-4 w-4" strokeWidth={3} /> : s.num}
                  </div>
                  <span className={`hidden text-sm font-medium sm:inline ${i <= currentStepIdx ? 'text-ink-100' : 'text-ink-500'}`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 ${i < currentStepIdx ? 'bg-accent-400' : 'bg-ink-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: Checkout form */}
          <div className="animate-fade-in">
            {/* Step 1: Information */}
            {step === 'information' && (
              <div className="animate-fade-in-up">
                <h1 className="font-display text-2xl font-bold text-ink-100 sm:text-3xl">LET'S GET YOUR ORDER STARTED.</h1>
                <p className="mt-2 text-sm text-ink-400">Enter your contact information to begin.</p>

                <div className="mt-8 space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-ink-100">Email address</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      placeholder="you@example.com"
                      className={`mt-2 w-full rounded-xl border bg-ink-900 px-4 py-3.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none ${
                        errors.email ? 'border-red-500' : 'border-ink-700 focus:border-accent-400'
                      }`}
                    />
                    {errors.email && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-ink-100">Phone number</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className={`mt-2 w-full rounded-xl border bg-ink-900 px-4 py-3.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none ${
                        errors.contactPhone ? 'border-red-500' : 'border-ink-700 focus:border-accent-400'
                      }`}
                    />
                    {errors.contactPhone && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {errors.contactPhone}</p>}
                  </div>

                  <label className="flex cursor-pointer items-center gap-3">
                    <button
                      onClick={() => setContact({ ...contact, subscribe: !contact.subscribe })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${contact.subscribe ? 'bg-accent-400' : 'bg-ink-700'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${contact.subscribe ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="text-sm text-ink-200">Email me order updates</span>
                  </label>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button onClick={() => navigate('/auth')} className="text-sm font-medium text-ink-300 hover:text-ink-100">
                    Already have an account? <span className="text-accent-400">Sign in</span>
                  </button>
                  <button onClick={goNext} className="flex items-center gap-2 rounded-full bg-accent-400 px-6 py-3.5 text-sm font-bold text-ink-950 transition-all duration-300 hover:scale-105 neon-glow">
                    CONTINUE TO SHIPPING <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 'shipping' && (
              <div className="animate-fade-in-up">
                <h1 className="font-display text-2xl font-bold text-ink-100 sm:text-3xl">WHERE SHOULD WE SEND IT?</h1>
                <p className="mt-2 text-sm text-ink-400">Enter your shipping address and choose delivery.</p>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <FormField label="First name" value={shipping.firstName} onChange={(v) => setShipping({ ...shipping, firstName: v })} error={errors.firstName} />
                  <FormField label="Last name" value={shipping.lastName} onChange={(v) => setShipping({ ...shipping, lastName: v })} error={errors.lastName} />

                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-ink-100">Country</label>
                    <select
                      value={shipping.country}
                      onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-ink-700 bg-ink-900 px-4 py-3.5 text-sm text-ink-100 focus:border-accent-400 focus:outline-none"
                    >
                      {['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <FormField label="Province/State" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v })} error={errors.state} />
                  <FormField label="City" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} error={errors.city} />

                  <div className="sm:col-span-2">
                    <FormField label="Address" value={shipping.address} onChange={(v) => setShipping({ ...shipping, address: v })} error={errors.address} />
                  </div>
                  <FormField label="Apartment/Suite (optional)" value={shipping.apt} onChange={(v) => setShipping({ ...shipping, apt: v })} />
                  <FormField label="Postal Code" value={shipping.postal} onChange={(v) => setShipping({ ...shipping, postal: v })} error={errors.postal} />
                  <FormField label="Phone" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} error={errors.shippingPhone} type="tel" />
                </div>

                <label className="mt-5 flex cursor-pointer items-center gap-3">
                  <button
                    onClick={() => setSaveAddress(!saveAddress)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${saveAddress ? 'bg-accent-400' : 'bg-ink-700'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${saveAddress ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm text-ink-200">Save this address</span>
                </label>

                {/* Shipping methods */}
                <div className="mt-8">
                  <h3 className="font-display text-lg font-semibold text-ink-100">Delivery Method</h3>
                  <div className="mt-4 space-y-3">
                    {(['standard', 'express', 'priority'] as ShippingMethod[]).map((method) => {
                      const [minD, maxD] = shippingDays(method);
                      const estStart = addDays(new Date(), minD).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const estEnd = addDays(new Date(), maxD).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const cost = subtotal - discount >= 150 && method === 'standard' ? 0 : shippingCost(method);
                      return (
                        <button
                          key={method}
                          onClick={() => setShippingMethod(method)}
                          className={`flex w-full items-center justify-between rounded-2xl border p-4 transition-all ${
                            shippingMethod === method ? 'border-accent-400 bg-accent-400/5' : 'border-ink-700 bg-ink-900 hover:border-ink-600'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              shippingMethod === method ? 'border-accent-400 bg-accent-400' : 'border-ink-600'
                            }`}>
                              {shippingMethod === method && <Check className="h-3 w-3 text-ink-950" strokeWidth={3} />}
                            </div>
                            <div className="text-left">
                              <p className="font-display text-sm font-bold text-ink-100">{shippingLabel(method)}</p>
                              <p className="text-xs text-ink-400">{minD}–{maxD} business days</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-sm font-bold text-ink-100">{cost === 0 ? 'FREE' : formatPrice(cost)}</p>
                            <p className="text-xs text-ink-400">Est. {estStart}–{estEnd}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button onClick={goBack} className="flex items-center gap-2 text-sm font-medium text-ink-300 hover:text-ink-100">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={goNext} className="flex items-center gap-2 rounded-full bg-accent-400 px-6 py-3.5 text-sm font-bold text-ink-950 transition-all duration-300 hover:scale-105 neon-glow">
                    CONTINUE TO PAYMENT <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && (
              <div className="animate-fade-in-up">
                <h1 className="font-display text-2xl font-bold text-ink-100 sm:text-3xl">SECURE CHECKOUT</h1>
                <p className="mt-2 text-sm text-ink-400">Choose your payment method. This is a demo checkout — no real charges.</p>

                {/* Demo notice */}
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-800 px-4 py-3">
                  <Lock className="h-4 w-4 shrink-0 text-accent-400" />
                  <p className="text-xs text-ink-300">Demo payment mode — no real transaction will occur. Card details are not stored or transmitted.</p>
                </div>

                {/* Payment method tabs */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <PaymentTab icon={CreditCard} label="Card" active={payment.method === 'card'} onClick={() => setPayment({ ...payment, method: 'card' })} />
                  <PaymentTab icon={Apple} label="Apple Pay" active={payment.method === 'applepay'} onClick={() => setPayment({ ...payment, method: 'applepay' })} />
                  <PaymentTab icon={Wallet} label="PayPal" active={payment.method === 'paypal'} onClick={() => setPayment({ ...payment, method: 'paypal' })} />
                  <PaymentTab icon={Truck} label="Cash on Delivery" active={payment.method === 'cod'} onClick={() => setPayment({ ...payment, method: 'cod' })} />
                </div>

                {/* Card payment form */}
                {payment.method === 'card' && (
                  <div className="mt-6 animate-fade-in">
                    {/* Card preview */}
                    <CardPreview
                      number={payment.cardNumber}
                      name={payment.cardName}
                      expiry={payment.cardExpiry}
                      brand={cardBrand}
                    />

                    <div className="mt-6 space-y-5">
                      <div>
                        <label className="text-sm font-semibold text-ink-100">Cardholder name</label>
                        <input
                          value={payment.cardName}
                          onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                          placeholder="John Doe"
                          className={`mt-2 w-full rounded-xl border bg-ink-900 px-4 py-3.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none ${
                            errors.cardName ? 'border-red-500' : 'border-ink-700 focus:border-accent-400'
                          }`}
                        />
                        {errors.cardName && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {errors.cardName}</p>}
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-ink-100">Card number</label>
                        <div className="relative mt-2">
                          <input
                            value={payment.cardNumber}
                            onChange={(e) => setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className={`w-full rounded-xl border bg-ink-900 px-4 py-3.5 pr-12 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none ${
                              errors.cardNumber ? 'border-red-500' : 'border-ink-700 focus:border-accent-400'
                            }`}
                          />
                          {cardBrand !== 'unknown' && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-ink-300">{cardBrand}</span>
                          )}
                        </div>
                        {errors.cardNumber && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-ink-100">Expiry date</label>
                          <input
                            value={payment.cardExpiry}
                            onChange={(e) => setPayment({ ...payment, cardExpiry: formatExpiry(e.target.value) })}
                            placeholder="MM/YY"
                            maxLength={5}
                            className={`mt-2 w-full rounded-xl border bg-ink-900 px-4 py-3.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none ${
                              errors.cardExpiry ? 'border-red-500' : 'border-ink-700 focus:border-accent-400'
                            }`}
                          />
                          {errors.cardExpiry && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {errors.cardExpiry}</p>}
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-ink-100">CVV</label>
                          <input
                            type="password"
                            value={payment.cardCvv}
                            onChange={(e) => setPayment({ ...payment, cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                            placeholder="•••"
                            maxLength={4}
                            className={`mt-2 w-full rounded-xl border bg-ink-900 px-4 py-3.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none ${
                              errors.cardCvv ? 'border-red-500' : 'border-ink-700 focus:border-accent-400'
                            }`}
                          />
                          {errors.cardCvv && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {errors.cardCvv}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Billing address */}
                    <label className="mt-6 flex cursor-pointer items-center gap-3">
                      <button
                        onClick={() => setPayment({ ...payment, billingSameAsShipping: !payment.billingSameAsShipping })}
                        className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                          payment.billingSameAsShipping ? 'border-accent-400 bg-accent-400' : 'border-ink-600'
                        }`}
                      >
                        {payment.billingSameAsShipping && <Check className="h-4 w-4 text-ink-950" strokeWidth={3} />}
                      </button>
                      <span className="text-sm text-ink-200">Billing address same as shipping</span>
                    </label>

                    {!payment.billingSameAsShipping && (
                      <div className="mt-4 grid gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-5 animate-fade-in sm:grid-cols-2">
                        <FormField label="First name" value={billingAddress.firstName} onChange={(v) => setBillingAddress({ ...billingAddress, firstName: v })} />
                        <FormField label="Last name" value={billingAddress.lastName} onChange={(v) => setBillingAddress({ ...billingAddress, lastName: v })} />
                        <div className="sm:col-span-2">
                          <FormField label="Address" value={billingAddress.address} onChange={(v) => setBillingAddress({ ...billingAddress, address: v })} error={errors.billAddress} />
                        </div>
                        <FormField label="City" value={billingAddress.city} onChange={(v) => setBillingAddress({ ...billingAddress, city: v })} error={errors.billCity} />
                        <FormField label="Postal Code" value={billingAddress.postal} onChange={(v) => setBillingAddress({ ...billingAddress, postal: v })} error={errors.billPostal} />
                      </div>
                    )}
                  </div>
                )}

                {/* Alternative payment info */}
                {payment.method !== 'card' && (
                  <div className="mt-6 rounded-2xl border border-ink-700 bg-ink-900 p-8 text-center animate-fade-in">
                    {payment.method === 'applepay' && <Apple className="mx-auto h-12 w-12 text-ink-100" />}
                    {payment.method === 'paypal' && <Wallet className="mx-auto h-12 w-12 text-ink-100" />}
                    {payment.method === 'cod' && <Truck className="mx-auto h-12 w-12 text-ink-100" />}
                    <p className="mt-4 font-display text-lg font-semibold text-ink-100">
                      {payment.method === 'applepay' && 'Apple Pay (Demo)'}
                      {payment.method === 'paypal' && 'PayPal (Demo)'}
                      {payment.method === 'cod' && 'Cash on Delivery'}
                    </p>
                    <p className="mt-2 text-sm text-ink-400">
                      {payment.method === 'cod'
                        ? 'Pay with cash when your order is delivered to your door.'
                        : 'You will be redirected to complete your payment (demo mode).'}
                    </p>
                  </div>
                )}

                {/* Trust indicators */}
                <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-4">
                  <div className="flex items-center gap-2 text-xs text-ink-400"><Shield className="h-4 w-4 text-accent-400" /> Secure Checkout</div>
                  <div className="flex items-center gap-2 text-xs text-ink-400"><Lock className="h-4 w-4 text-accent-400" /> Your payment information is protected</div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button onClick={goBack} className="flex items-center gap-2 text-sm font-medium text-ink-300 hover:text-ink-100">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={goNext} className="flex items-center gap-2 rounded-full bg-accent-400 px-6 py-3.5 text-sm font-bold text-ink-950 transition-all duration-300 hover:scale-105 neon-glow">
                    REVIEW ORDER <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 'review' && (
              <div className="animate-fade-in-up">
                <h1 className="font-display text-2xl font-bold text-ink-100 sm:text-3xl">READY TO STEP INTO THE FUTURE?</h1>
                <p className="mt-2 text-sm text-ink-400">Review your order before placing it.</p>

                <div className="mt-8 space-y-4">
                  {/* Contact */}
                  <ReviewSection title="Contact" icon={Mail} onEdit={() => setStep('information')}>
                    <p className="text-sm text-ink-200">{contact.email}</p>
                    <p className="text-sm text-ink-400">{contact.phone}</p>
                  </ReviewSection>

                  {/* Shipping */}
                  <ReviewSection title="Shipping" icon={MapPin} onEdit={() => setStep('shipping')}>
                    <p className="text-sm text-ink-200">{shipping.firstName} {shipping.lastName}</p>
                    <p className="text-sm text-ink-400">{shipping.address}{shipping.apt ? `, ${shipping.apt}` : ''}</p>
                    <p className="text-sm text-ink-400">{shipping.city}, {shipping.state} {shipping.postal}</p>
                    <p className="text-sm text-ink-400">{shipping.country}</p>
                    <p className="text-sm text-ink-400">{shipping.phone}</p>
                  </ReviewSection>

                  {/* Delivery */}
                  <ReviewSection title="Delivery" icon={Truck} onEdit={() => setStep('shipping')}>
                    <p className="text-sm text-ink-200">{shippingLabel(shippingMethod)}</p>
                    <p className="text-sm text-ink-400">
                      Est. {addDays(new Date(), shippingDays(shippingMethod)[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      –{addDays(new Date(), shippingDays(shippingMethod)[1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </ReviewSection>

                  {/* Payment */}
                  <ReviewSection title="Payment" icon={CreditCard} onEdit={() => setStep('payment')}>
                    {payment.method === 'card' ? (
                      <>
                        <p className="text-sm text-ink-200 capitalize">{cardBrand} •••• {payment.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                        <p className="text-sm text-ink-400">{payment.cardName}</p>
                      </>
                    ) : (
                      <p className="text-sm text-ink-200 capitalize">
                        {payment.method === 'cod' ? 'Cash on Delivery' : payment.method === 'applepay' ? 'Apple Pay' : 'PayPal'} (Demo)
                      </p>
                    )}
                  </ReviewSection>

                  {/* Items */}
                  <ReviewSection title="Items" icon={Package} onEdit={() => navigate('/cart')}>
                    <div className="space-y-2">
                      {activeCartItems.map((item) => {
                        const product = getProductById(item.productId);
                        if (!product) return null;
                        const color = product.colors.find((c) => c.id === item.colorId);
                        return (
                          <div key={`${item.productId}-${item.colorId}-${item.sizeEu}`} className="flex items-center gap-3">
                            <img src={color?.image ?? product.colors[0].image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                            <div className="flex-1">
                              <p className="text-sm text-ink-200">{product.name}</p>
                              <p className="text-xs text-ink-400">{color?.name} · EU {item.sizeEu} · Qty {item.quantity}</p>
                            </div>
                            <span className="text-sm font-semibold text-ink-100">{formatPrice(product.price * item.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </ReviewSection>
                </div>

                {/* Terms checkbox */}
                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-700 bg-ink-900 p-4">
                  <button
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                      agreeTerms ? 'border-accent-400 bg-accent-400' : 'border-ink-600'
                    }`}
                  >
                    {agreeTerms && <Check className="h-4 w-4 text-ink-950" strokeWidth={3} />}
                  </button>
                  <span className="text-sm text-ink-200">I agree to the Terms &amp; Conditions and Return Policy.</span>
                </label>

                {/* Place order button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={!agreeTerms || orderState === 'processing'}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-5 text-base font-bold transition-all duration-300 ${
                    agreeTerms && orderState !== 'processing'
                      ? 'bg-accent-400 text-ink-950 hover:scale-[1.02] neon-glow'
                      : 'bg-ink-800 text-ink-500 cursor-not-allowed'
                  }`}
                >
                  {orderState === 'processing' ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> PROCESSING ORDER...</>
                  ) : orderState === 'success' ? (
                    <><Check className="h-5 w-5" /> ORDER CONFIRMED</>
                  ) : orderState === 'error' ? (
                    <><AlertCircle className="h-5 w-5" /> TRY AGAIN</>
                  ) : (
                    <>PLACE ORDER — {formatPrice(total)}</>
                  )}
                </button>

                {orderState === 'error' && (
                  <p className="mt-3 flex items-center justify-center gap-2 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" /> Something went wrong. Please try again.
                  </p>
                )}

                <button onClick={goBack} className="mt-4 flex items-center gap-2 text-sm font-medium text-ink-300 hover:text-ink-100">
                  <ArrowLeft className="h-4 w-4" /> Back to Payment
                </button>
              </div>
            )}
          </div>

          {/* Right: Sticky order summary (desktop) */}
          <div className="hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <OrderSummary shippingMethod={shippingMethod} appliedPromo={appliedPromo} onEditCart={() => navigate('/cart')} state={shipping.state} />

              {/* Promo code in summary */}
              <PromoCodeSection
                appliedPromo={appliedPromo}
                promoInput={promoInput}
                setPromoInput={setPromoInput}
                promoError={promoError}
                promoSuccess={promoSuccess}
                onApply={handleApplyPromo}
                onRemove={() => { setAppliedPromo(null); setPromoSuccess(null); }}
              />
            </div>
          </div>

          {/* Mobile: collapsible summary + sticky CTA */}
          <div className="lg:hidden">
            {/* Mobile sticky bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-700 glass px-4 py-3">
              <button
                onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
                className="flex w-full items-center justify-between"
              >
                <span className="text-sm text-ink-300">
                  {mobileSummaryOpen ? 'Hide summary' : 'Show order summary'}
                </span>
                <span className="font-display text-lg font-bold text-ink-100">{formatPrice(total)}</span>
              </button>
            </div>

            {mobileSummaryOpen && (
              <div className="fixed bottom-16 left-0 right-0 z-30 max-h-[60vh] overflow-y-auto rounded-t-3xl border-t border-ink-700 glass p-4 animate-slide-up">
                <OrderSummary shippingMethod={shippingMethod} appliedPromo={appliedPromo} onEditCart={() => navigate('/cart')} state={shipping.state} />
                <div className="mt-4">
                  <PromoCodeSection
                    appliedPromo={appliedPromo}
                    promoInput={promoInput}
                    setPromoInput={setPromoInput}
                    promoError={promoError}
                    promoSuccess={promoSuccess}
                    onApply={handleApplyPromo}
                    onRemove={() => { setAppliedPromo(null); setPromoSuccess(null); }}
                  />
                </div>
              </div>
            )}

            {/* Spacer for sticky bar */}
            <div className="h-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label, value, onChange, error, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-ink-100">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 w-full rounded-xl border bg-ink-900 px-4 py-3.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none ${
          error ? 'border-red-500' : 'border-ink-700 focus:border-accent-400'
        }`}
      />
      {error && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>}
    </div>
  );
}

function PaymentTab({ icon: Icon, label, active, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
        active ? 'border-accent-400 bg-accent-400/10 text-accent-400' : 'border-ink-700 bg-ink-900 text-ink-300 hover:text-ink-100'
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function CardPreview({ number, name, expiry, brand }: { number: string; name: string; expiry: string; brand: string }) {
  const display = number || '•••• •••• •••• ••••';
  const masked = display.padEnd(19, '•').slice(0, 19);
  return (
    <div className="relative aspect-[1.6/1] max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 p-6 neon-glow">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-accent-400/10 blur-3xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="h-8 w-12 rounded-md bg-gradient-to-br from-accent-400 to-volt-600" />
          <span className="text-sm font-bold uppercase text-ink-200">{brand !== 'unknown' ? brand : ''}</span>
        </div>
        <p className="font-display text-lg font-medium tracking-widest text-ink-100">{masked}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-400">Cardholder</p>
            <p className="text-sm font-medium text-ink-100">{name || 'YOUR NAME'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-400">Expires</p>
            <p className="text-sm font-medium text-ink-100">{expiry || 'MM/YY'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, icon: Icon, onEdit, children }: { title: string; icon: React.ComponentType<{ className?: string }>; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-accent-400" />
          <h3 className="font-display text-sm font-bold text-ink-100">{title}</h3>
        </div>
        <button onClick={onEdit} className="text-xs font-medium text-ink-400 hover:text-accent-400">EDIT</button>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ProcessingOverlay({ step }: { step: number }) {
  const steps = [
    { label: 'Verifying details', icon: Check },
    { label: 'Securing payment', icon: Lock },
    { label: 'Confirming inventory', icon: Package },
    { label: 'Preparing your order', icon: Zap },
    { label: 'Order confirmed', icon: Check },
  ];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950 scan-line">
      <div className="w-full max-w-md px-6 text-center">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-ink-800" />
          <div className="absolute inset-0 rounded-full border-4 border-accent-400 border-t-transparent animate-spin-slow neon-glow" />
          <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        </div>
        <h2 className="mt-8 font-display text-2xl font-bold text-ink-100 neon-text">SECURELY PROCESSING YOUR ORDER</h2>
        <p className="mt-2 text-sm text-ink-400">Please wait while we finalize your purchase.</p>

        <div className="mt-8 space-y-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                i < step ? 'border-accent-400/30 bg-accent-400/5' :
                i === step ? 'border-accent-400 bg-accent-400/10' :
                'border-ink-800 bg-ink-900'
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                i < step ? 'bg-accent-400' :
                i === step ? 'bg-accent-400/20' : 'bg-ink-800'
              }`}>
                {i < step ? (
                  <Check className="h-4 w-4 text-ink-950" strokeWidth={3} />
                ) : i === step ? (
                  <Loader2 className="h-4 w-4 animate-spin text-accent-400" />
                ) : (
                  <s.icon className="h-4 w-4 text-ink-500" />
                )}
              </div>
              <span className={`text-sm font-medium ${i <= step ? 'text-ink-100' : 'text-ink-500'}`}>
                {s.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PromoCodeSection({
  appliedPromo,
  promoInput,
  setPromoInput,
  promoError,
  promoSuccess,
  onApply,
  onRemove,
}: {
  appliedPromo: PromoCode | null;
  promoInput: string;
  setPromoInput: (v: string) => void;
  promoError: string | null;
  promoSuccess: string | null;
  onApply: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Have a promo code?</p>
      {appliedPromo ? (
        <div className="mt-2 flex items-center justify-between rounded-xl border border-accent-400/30 bg-accent-400/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-accent-400" />
            <div>
              <p className="text-sm font-bold text-accent-400">{appliedPromo.code}</p>
              <p className="text-xs text-ink-300">{appliedPromo.description}</p>
            </div>
          </div>
          <button onClick={onRemove} className="text-ink-400 hover:text-ink-100">✕</button>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          <input
            value={promoInput}
            onChange={(e) => { setPromoInput(e.target.value); }}
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
            placeholder="ENTER CODE"
            className="flex-1 rounded-xl border border-ink-700 bg-ink-800 px-4 py-2.5 text-sm uppercase text-ink-100 placeholder:text-ink-500 focus:border-accent-400 focus:outline-none"
          />
          <button onClick={onApply} className="rounded-xl bg-ink-700 px-5 py-2.5 text-sm font-bold text-ink-100 hover:bg-ink-600">APPLY</button>
        </div>
      )}
      {promoError && <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {promoError}</p>}
      {promoSuccess && <p className="mt-2 flex items-center gap-1.5 text-xs text-accent-400 animate-fade-in"><Check className="h-3.5 w-3.5" /> {promoSuccess}</p>}
      <p className="mt-2 text-xs text-ink-500">Try: SNEAK10, WELCOME15, FUTURE20</p>
    </div>
  );
}
