import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Smartphone, Laptop as LaptopIcon, Tv, MoreHorizontal, ArrowLeft, ArrowRight,
  CheckCircle, Plus, Calendar, Home, Briefcase, MapPin, UploadCloud, Info, Trash2, Mic, MicOff, Star, Tablet, Watch, X,
  Map as MapIcon, ClipboardList, Check, ShieldCheck, Zap, Award, Shield, Bell, Tag, Headset, ChevronDown, Apple, Navigation, PenLine, Sparkles
} from 'lucide-react';
import { RepairOrder, AddressItem } from '../types';
import {
  fetchDeviceTypes,
  fetchBrandsByType,
  fetchModelsByTypeAndBrand,
  fetchDeviceDamages,
  fetchDevicePrice,
  fetchAddresses,
  createAddress,
  createRepairBooking
} from '../api/deviceApi';
import MapSelector from './MapSelector';
import RewardWheelModal from './RewardWheelModal';

interface ClientBookingWizardProps {
  token: string;
  initialCategory?: string;
  addresses?: AddressItem[];
  onAddAddress?: (newAddr: Omit<AddressItem, 'id'>) => void;
  onConfirmBooking?: (newBooking: Omit<RepairOrder, 'id' | 'submittedAt'>) => void;
  onCancel: () => void;
}

interface UploadedImageItem {
  id: string;
  url: string;
  file?: File | Blob;
}

const mockPreloadedPhotos = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBw-Mb46m1slpQ30QiaJ9quEqgPTtcTxRccCx9hsKGXAA5zpJzwCAISARBkFMREL1jXzEnUITIzcsuQhB4wv9qN4zTreKnq7Vr6OcXG5rEG5hK1tmJGx0BBvX_n97MQ1iPmseek5U2gwW4SEpC0supdBNRt_j8dRIDz00xh4ztb_z7ECiC3SNfMY9R7Qv8pIjTple-WhRt0SdsD5Q_ft8kOdG2xux0b6B7V0TZP1FSa-Z7FuqoR810RAzfsnzx1EPIsTO6PnN4-M4rP',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAeP7B_-4-mYmqZ9Wz1VIOReeRf9ZWd0guLWaYK5cXiR09MQ5caIMMV00ucpSoZH4pGuz6CIhW91u_b00XzbdicYl9MAMBPRhwHB674CHFaCYLOGF7RiBTPRX-xhqIQeYIoUWfVxW0iVPftTmSLZuce22Hfurb7cpVdO2rutgAAIqqFeuTbTNaaRFVQqR4kJ4xSFlMQcDi5nTtlwHIFvYg0zm_z-TLSD62hJxmJFgQaIHy_urtY7oFSDGZwAJCHXP6uOvANjdzEDsWF',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC-1wt_FqmOsdWwiLvSm-p9JxNRzP08ozzQTtxNuuFI8dcbqFjgQjS27ptlY1om_LqP9CQAzamxI_H-vans2-CFAVP9RDCoSYTe0HAb_w5XHiBCTtxRrBsyVzL78veQjs7HazT8r21huSutfQJji0JSnoJu3qpMo6jx4YFBSisOTzE-ZoGFbGGXj8h5RpKDhz3iQuc9Biy8ZRfmCniVYF9oM1pgpzL3ASA07wY0QBzIZdNwHN8Q_fMIIKCfH3NHFspEXItQYeo35HxL'
];

interface CacheState {
  deviceCategory: string;
  brand: string;
  model: string;
  issue: string;
  description: string;
  uploadedImages: UploadedImageItem[];
  selectedAddressId: string;
  brandsList: string[];
  modelsList: string[];
  issuesList: string[];
}

// Module-level cache to preserve File objects across SPA route changes
let spaStateCache: CacheState | null = null;

export default function ClientBookingWizard({
  token,
  initialCategory = 'Smartphone',
  onConfirmBooking,
  onCancel
}: ClientBookingWizardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetCategory = location.state?.category || initialCategory;

  const pathname = location.pathname;
  let step = 1;
  if (pathname.includes('/issue')) step = 2;
  else if (pathname.includes('/logistics')) step = 3;
  else if (pathname.includes('/review')) step = 4;
  else step = 1; // default to device selection (e.g. /device)

  const setStep = (nextStep: number) => {
    let subpath = 'device';
    if (nextStep === 2) subpath = 'issue';
    else if (nextStep === 3) subpath = 'logistics';
    else if (nextStep === 4) subpath = 'review';
    navigate(`/customer/book/wizard/${subpath}`, { state: { category: deviceCategory } });
  };

  const [deviceTypes, setDeviceTypes] = useState<string[]>([]);
  const [brandsList, setBrandsList] = useState<string[]>([]);
  const [modelsList, setModelsList] = useState<string[]>([]);
  const [issuesList, setIssuesList] = useState<string[]>([]);
  const [addressesList, setAddressesList] = useState<any[]>([]);
  const [estimatedCost, setEstimatedCost] = useState<number>(69.00);
  const [bookingInProgress, setBookingInProgress] = useState<boolean>(false);

  // Wizard Core Data States
  const [deviceCategory, setDeviceCategory] = useState<string>(targetCategory);
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [issue, setIssue] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [priceTier, setPriceTier] = useState<string>('Up to ₹2499 (Gold)');

  // Address Dialog Modal Form States
  const [showAddressChoiceModal, setShowAddressChoiceModal] = useState<boolean>(false);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [newAddrLabel, setNewAddrLabel] = useState<string>('Home');
  const [newAddrFullName, setNewAddrFullName] = useState<string>('');
  const [newAddrMobile, setNewAddrMobile] = useState<string>('');
  const [newAddrLine1, setNewAddrLine1] = useState<string>('');
  const [newAddrLine2, setNewAddrLine2] = useState<string>('');
  const [newAddrLandmark, setNewAddrLandmark] = useState<string>('');
  const [newAddrCity, setNewAddrCity] = useState<string>('');
  const [newAddrState, setNewAddrState] = useState<string>('');
  const [newAddrPincode, setNewAddrPincode] = useState<string>('');
  const [newAddrLat, setNewAddrLat] = useState<number | null>(null);
  const [newAddrLng, setNewAddrLng] = useState<number | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [autofilled, setAutofilled] = useState<boolean>(false);

  // Interface Helper States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showRewardWheel, setShowRewardWheel] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | null>(null);
  const [showChoiceScreen, setShowChoiceScreen] = useState<boolean>(true);

  const loadAddresses = () => {
    fetchAddresses(token).then(data => {
      setAddressesList(data);
    });
  };

  useEffect(() => {
    if (location.pathname === '/customer/book/wizard' || location.pathname === '/customer/book/wizard/') {
      navigate('/customer/book/wizard/device', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    // 1. Fetch device types
    fetchDeviceTypes().then(types => {
      setDeviceTypes(types);
    });

    // 2. Check if we have a saved state to restore
    const savedSessionStr = sessionStorage.getItem('booking_wizard_state');
    if (savedSessionStr) {
      try {
        const savedSession = JSON.parse(savedSessionStr);
        if (spaStateCache) {
          setDeviceCategory(spaStateCache.deviceCategory);
          setBrand(spaStateCache.brand);
          setModel(spaStateCache.model);
          setIssue(spaStateCache.issue);
          setDescription(spaStateCache.description);
          setUploadedImages(spaStateCache.uploadedImages);
          setBrandsList(spaStateCache.brandsList);
          setModelsList(spaStateCache.modelsList);
          setIssuesList(spaStateCache.issuesList);
          setSelectedAddressId(savedSession.selectedAddressId || spaStateCache.selectedAddressId);
        } else {
          setDeviceCategory(savedSession.deviceCategory || targetCategory);
          setBrand(savedSession.brand || '');
          setModel(savedSession.model || '');
          setIssue(savedSession.issue || '');
          setDescription(savedSession.description || '');
          setSelectedAddressId(savedSession.selectedAddressId || '');
          if (savedSession.uploadedImages) setUploadedImages(savedSession.uploadedImages);
          if (savedSession.brandsList) setBrandsList(savedSession.brandsList);
          if (savedSession.modelsList) setModelsList(savedSession.modelsList);
          if (savedSession.issuesList) setIssuesList(savedSession.issuesList);
          if (savedSession.priceTier) setPriceTier(savedSession.priceTier);
        }
      } catch (e) {
        console.error("Error restoring state:", e);
      }
      sessionStorage.removeItem('booking_wizard_state');
      spaStateCache = null;

      // Load addresses list
      fetchAddresses(token).then(data => {
        setAddressesList(data);
      });
    } else {
      fetchDeviceTypes().then(types => {
        if (types.length > 0) {
          const matched = types.find(t => t.toLowerCase() === targetCategory.toLowerCase()) || types[0];
          setDeviceCategory(matched);
          fetchBrandsByType(matched).then(brands => {
            const filteredBrands = brands.filter(b => b.toLowerCase() !== 'other');
            setBrandsList(filteredBrands);
            if (filteredBrands.length > 0) {
              setBrand(filteredBrands[0]);
              fetchModelsByTypeAndBrand(matched, filteredBrands[0]).then(models => {
                const filteredModels = models.filter(m => m.toLowerCase() !== 'generic model' && m.toLowerCase() !== 'other');
                setModelsList(filteredModels);
                if (filteredModels.length > 0) {
                  setModel(filteredModels[0]);
                  fetchDeviceDamages(matched, filteredBrands[0], filteredModels[0]).then(damages => {
                    const filteredDamages = damages.filter(d => d.toLowerCase() !== 'other');
                    setIssuesList(filteredDamages);
                    if (filteredDamages.length > 0) {
                      setIssue(filteredDamages[0]);
                    }
                  });
                }
              });
            }
          });
        }
      });
      loadAddresses();
    }
  }, [token]);

  useEffect(() => {
    if (deviceCategory && brand && model && issue) {
      if (issue === 'Other') {
        setEstimatedCost(0);
        return;
      }
      fetchDevicePrice(deviceCategory, brand, model, issue).then(price => {
        setEstimatedCost(price);
      });
    }
  }, [deviceCategory, brand, model, issue]);

  const handleSelectCategory = (type: string) => {
    setDeviceCategory(type);
    setBrand('');
    setModel('');
    setBrandsList([]);
    setModelsList([]);
    setIssuesList([]);
    setIssue('');
    fetchBrandsByType(type).then(brands => {
      const filtered = brands.filter(b => b.toLowerCase() !== 'other');
      setBrandsList(filtered);
      if (filtered.length > 0) {
        setBrand(filtered[0]);
        fetchModelsByTypeAndBrand(type, filtered[0]).then(models => {
          const filteredModels = models.filter(m => m.toLowerCase() !== 'generic model' && m.toLowerCase() !== 'other');
          setModelsList(filteredModels);
          if (filteredModels.length > 0) {
            setModel(filteredModels[0]);
            fetchDeviceDamages(type, filtered[0], filteredModels[0]).then(damages => {
              const filteredDamages = damages.filter(d => d.toLowerCase() !== 'other');
              setIssuesList(filteredDamages);
              if (filteredDamages.length > 0) setIssue(filteredDamages[0]);
            });
          }
        });
      }
    });
  };

  const handleSelectBrand = (newBrand: string) => {
    setBrand(newBrand);
    setModel('');
    setModelsList([]);
    setIssuesList([]);
    setIssue('');
    fetchModelsByTypeAndBrand(deviceCategory, newBrand).then(models => {
      const filteredModels = models.filter(m => m.toLowerCase() !== 'generic model' && m.toLowerCase() !== 'other');
      setModelsList(filteredModels);
      if (filteredModels.length > 0) {
        setModel(filteredModels[0]);
        fetchDeviceDamages(deviceCategory, newBrand, filteredModels[0]).then(damages => {
          const filteredDamages = damages.filter(d => d.toLowerCase() !== 'other');
          setIssuesList(filteredDamages);
          if (filteredDamages.length > 0) setIssue(filteredDamages[0]);
        });
      }
    });
  };

  const handleSelectModel = (newModel: string) => {
    setModel(newModel);
    setIssuesList([]);
    setIssue('');
    fetchDeviceDamages(deviceCategory, brand, newModel).then(damages => {
      const filteredDamages = damages.filter(d => d.toLowerCase() !== 'other');
      setIssuesList(filteredDamages);
      if (filteredDamages.length > 0) {
        setIssue(filteredDamages[0]);
      }
    });
  };

  const handleChooseAddress = () => {
    spaStateCache = {
      deviceCategory,
      brand,
      model,
      issue,
      description,
      uploadedImages,
      selectedAddressId,
      brandsList,
      modelsList,
      issuesList
    };

    const serialized = {
      deviceCategory,
      brand,
      model,
      issue,
      description,
      selectedAddressId,
      uploadedImages: uploadedImages.map(img => ({ id: img.id, url: img.url })),
      brandsList,
      modelsList,
      issuesList,
      priceTier
    };
    sessionStorage.setItem('booking_wizard_state', JSON.stringify(serialized));

    navigate('/customer/addresses', { state: { selectMode: true } });
  };

  // Brand list based on category
  const currentBrands = brandsList.filter(b => b.toLowerCase() !== 'other');
  const currentModels = modelsList.filter(m => m.toLowerCase() !== 'generic model' && m.toLowerCase() !== 'other');

  const priorityLevel = (): 'High' | 'Medium' | 'Low' => {
    if (issue.toLowerCase().includes('liquid') || issue.toLowerCase().includes('screen') || issue.toLowerCase().includes('damage')) {
      return 'High';
    }
    if (issue.toLowerCase().includes('charging') || issue.toLowerCase().includes('battery')) {
      return 'Medium';
    }
    return 'Low';
  };

  // Mic Simulation dictation
  const handleSimulateVoice = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setDescription(prev =>
          prev + (prev ? ' ' : '') + "Screen is entirely black and there are green lines running vertically. Phone fell on concrete floor."
        );
        setIsListening(false);
      }, 2500);
    }
  };

  // Photo Uploaders
  const handleAddMockPhoto = () => {
    if (uploadedImages.length >= 4) {
      navigate('/customer/alert?message=' + encodeURIComponent("Maximum 4 files upload reached.") + '&type=error');
      return;
    }
    const nextPhoto = mockPreloadedPhotos[uploadedImages.length % mockPreloadedPhotos.length];
    setUploadedImages(prev => [...prev, { id: Math.random().toString(), url: nextPhoto }]);
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    const newItems: UploadedImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      if (uploadedImages.length + newItems.length >= 4) {
        navigate('/customer/alert?message=' + encodeURIComponent("Maximum 4 files upload reached.") + '&type=error');
        break;
      }
      const file = files[i];
      const url = URL.createObjectURL(file);
      newItems.push({ id: Math.random().toString(), url, file });
    }

    setUploadedImages(prev => [...prev, ...newItems]);
  };

  const handleRemovePhoto = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleLocationSelect = (lat: number, lng: number, details: any) => {
    setNewAddrLat(lat);
    setNewAddrLng(lng);
    setNewAddrLine1(details.line1 || '');
    setNewAddrLine2(details.line2 || '');
    setNewAddrCity(details.city || '');
    setNewAddrState(details.state || '');
    setNewAddrPincode(details.pincode || '');
    setAutofilled(true);
    setTimeout(() => setAutofilled(false), 3000);
  };

  // Submit address modal
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrFullName || !newAddrMobile || !newAddrLine1 || !newAddrCity || !newAddrState || !newAddrPincode) {
      navigate('/customer/alert?message=' + encodeURIComponent("Please fill in all the required fields.") + '&type=error');
      return;
    }
    const res = await createAddress(token, {
      label: newAddrLabel,
      full_name: newAddrFullName,
      mobile_number: newAddrMobile,
      address_line1: newAddrLine1,
      address_line2: newAddrLine2 || null,
      landmark: newAddrLandmark || null,
      city: newAddrCity,
      state: newAddrState,
      pincode: newAddrPincode,
      latitude: newAddrLat,
      longitude: newAddrLng,
      is_active: 1
    });

    if (res.success) {
      if (res.data) {
        setAddressesList(prev => [res.data, ...prev]);
        setSelectedAddressId(String(res.data.id));
      }
      // Reset fields
      setNewAddrFullName('');
      setNewAddrMobile('');
      setNewAddrLine1('');
      setNewAddrLine2('');
      setNewAddrLandmark('');
      setNewAddrCity('');
      setNewAddrState('');
      setNewAddrPincode('');
      setNewAddrLat(null);
      setNewAddrLng(null);
      setShowMap(false);
      setShowAddressModal(false);
    } else {
      navigate('/customer/alert?message=' + encodeURIComponent(res.message || "Failed to add address") + '&type=error');
    }
  };

  const handleFinalSubmit = async () => {
    setBookingInProgress(true);

    try {
      // 1. Prepare files: convert any mock images to Blobs
      const blobs: Blob[] = [];
      for (const img of uploadedImages) {
        if (img.file) {
          blobs.push(img.file);
        } else if (img.url.startsWith('http')) {
          try {
            const res = await fetch(img.url);
            const blob = await res.blob();
            blobs.push(blob);
          } catch (err) {
            console.error("Failed to fetch mock image blob, skipping", err);
          }
        }
      }

      // 2. Submit to backend
      const bookingData = {
        device_brand: brand || 'Other',
        device_model: model || 'Generic Model',
        problem_type: issue || 'General',
        problem_description: (description || 'No description supplied.') + (priceTier ? `\n\nBudget Tier: ${priceTier}` : ''),
        address_id: Number(selectedAddressId),
        preferred_date: new Date().toISOString().split('T')[0], // Automatically set current date
        price: estimatedCost
      };

      const result = await createRepairBooking(token, bookingData, blobs);
      if (result.success) {
        // Clear wizard cache
        sessionStorage.removeItem('booking_wizard_state');
        setConfirmedBookingId(result.data.id);
        setShowRewardWheel(true);
      } else {
        navigate('/customer/alert?message=' + encodeURIComponent(result.message || "Failed to submit booking") + '&type=error');
        setBookingInProgress(false);
      }
    } catch (err) {
      console.error(err);
      navigate('/customer/alert?message=' + encodeURIComponent("Error submitting booking") + '&type=error');
    } finally {
      setBookingInProgress(false);
    }
  };

  const getSelectedAddressText = () => {
    const addr = addressesList.find(a => String(a.id) === selectedAddressId);
    if (!addr) return 'doorstep Address';
    return `${addr.full_name} - ${addr.address_line1}, ${addr.city}`;
  };

  return (
    <div className="flex-grow flex flex-col p-5 bg-[#f9f9fc] animate-fadeIn transition-all select-none">
      {/* Loading overlay */}
      {bookingInProgress && (
        <div className="fixed inset-0 bg-[#004c4c]/90 backdrop-blur-md flex flex-col items-center justify-center z-[99999] animate-fadeIn">
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="w-16 h-16 border-4 border-emerald-300 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-black tracking-widest uppercase animate-pulse">Securing Order</p>
            <p className="text-xs text-teal-100 font-medium">Please wait while we record your doorstep repair...</p>
          </div>
        </div>
      )}

      {/* Back button header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-1">
          <button
            onClick={step > 1 ? () => setStep(step - 1) : () => navigate('/customer/book')}
            className="p-1.5 -ml-1.5 text-slate-700 active:scale-95 transition-all rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="h-[22px] w-[22px]" />
          </button>
          <div className="flex items-center gap-2">
            {/* Custom Logo */}
            <div className="relative text-[#0284c7] flex items-center justify-center ml-1 mr-1.5">
              <Smartphone className="w-[22px] h-[22px] stroke-[2]" />
              <Check className="w-[18px] h-[18px] absolute -right-2 -bottom-0.5 stroke-[4]" />
              <Sparkles className="w-2.5 h-2.5 absolute -right-2 -top-0.5" />
            </div>
            <div className="flex flex-col mt-0.5">
              <h1 className="text-[17px] font-black text-slate-800 leading-none mb-1.5">Display Fix Go</h1>
              <span className="text-[12px] font-bold text-slate-500 leading-none">Book Repair</span>
            </div>
          </div>
        </div>
        <span className="text-slate-700 font-bold text-sm uppercase tracking-widest">
          Step {step} of 4
        </span>
      </div>

      {/* Progress horizontal indicator */}
      <div className="relative mb-6 select-none mt-2">
        <div className="flex items-center justify-between px-6 relative z-10">
          {[
            { num: 1, label: 'Device' },
            { num: 2, label: 'Issue' },
            { num: 3, label: 'Details' },
            { num: 4, label: 'Review' }
          ].map((item, index) => (
            <React.Fragment key={item.num}>
              <div className="flex flex-col items-center relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] transition-all z-10 ${step > item.num
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : step === item.num
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                  {step > item.num ? <Check className="h-5 w-5" strokeWidth={3} /> : item.num}
                </div>
                <span className={`absolute -bottom-5 text-[10px] font-bold whitespace-nowrap transition-colors ${step >= item.num ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                  {item.label}
                </span>
              </div>
              {item.num < 4 && (
                <div className="flex-1 h-[2px] mx-1 -mt-5 z-0 flex items-center">
                  <div className={`h-full w-full transition-all ${step > item.num ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Floating graphic */}
        <div className="absolute top-[-30px] right-0 opacity-80 pointer-events-none">
          <div className="relative w-20 h-24">
            <div className="absolute inset-0 bg-blue-50/50 rounded-full blur-xl"></div>
            <div className="absolute right-2 top-2 w-14 h-20 bg-slate-800 rounded-xl border-[3px] border-slate-300 shadow-xl flex items-center justify-center transform rotate-[10deg]">
              <div className="w-6 h-6 border-2 border-blue-400/30 rounded-full border-dashed animate-[spin_10s_linear_infinite]"></div>
            </div>
            <div className="absolute bottom-2 right-[-5px] w-8 h-8 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: DEVICE SELECTION SCREEN */}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-start animate-fadeIn">
          <h1 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">Book a Repair</h1>
          <p className="text-sm text-slate-500 mb-6">Choose the device category you want to repair.</p>

          <div className="grid grid-cols-1 gap-4">
            {deviceTypes.map((type) => {
              const isSelected = deviceCategory === type;

              const getCategoryDetails = (catType: string) => {
                const t = catType.toLowerCase();
                if (t.includes('phone') || t.includes('mobile') || t.includes('smart')) {
                  if (t.includes('watch')) {
                    return { label: catType + ' Repair', sub: 'Apple Watch, Galaxy Active & Fitbits', icon: Watch };
                  }
                  return { label: catType + ' Repair', sub: 'Smartphones & Phablets', icon: Smartphone };
                } else if (t.includes('laptop') || t.includes('computer')) {
                  return { label: catType + ' Repair', sub: 'MacBooks, PCs & Chromebooks', icon: LaptopIcon };
                } else if (t.includes('tv') || t.includes('television')) {
                  return { label: catType + ' Repair', sub: 'LED, OLED & Ultra-HD TVs', icon: Tv };
                } else if (t.includes('tablet') || t.includes('ipad')) {
                  return { label: catType + ' Repair', sub: 'iPads, Android & E-Readers', icon: Tablet };
                } else if (t.includes('watch') || t.includes('wearable')) {
                  return { label: catType + ' Repair', sub: 'Apple Watch & Smart Wearables', icon: Watch };
                } else if (t.includes('audio') || t.includes('speaker') || t.includes('sound')) {
                  return { label: catType + ' Repair', sub: 'Speakers, Headphones & Audio', icon: Mic };
                } else {
                  return { label: catType + ' Devices', sub: 'Gadgets, Accessories & Wearables', icon: MoreHorizontal };
                }
              };

              const details = getCategoryDetails(type);
              const IconComp = details.icon;

              return (
                <button
                  key={type}
                  onClick={() => {
                    handleSelectCategory(type);
                    setStep(2);
                  }}
                  className={`relative flex items-center p-4 rounded-[20px] text-left transition-all active:scale-[0.98] cursor-pointer ${isSelected
                      ? 'bg-emerald-50/60 border border-emerald-200 shadow-sm'
                      : 'bg-white border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
                    }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mr-4 transition-all ${isSelected ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-500/30' : 'bg-slate-100'
                    }`}>
                    <IconComp className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-black text-base ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{details.label}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{details.sub}</p>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-300'
                    }`}>
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Banner Card */}
          <div className="mt-8 rounded-[24px] overflow-hidden shadow-lg relative h-48 border border-slate-200">
            <img
              className="absolute inset-0 w-full h-full object-cover z-0"
              alt="Workbench with devices"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXJtb5sFDw-KgWia99JxAJqJ_ZS4c6al4Giee52yMoymWRxyCPrkMivgAfsT_SkBC2hCD9ap7RulUXODObjfMvYnUR3rr-EcGbkj4hSXmwSMnuGY2v8OwBtVR7No7tKjtZhm1p_0NroBa-VNPW8XXWou0jSfJ4pXLY1leTzHqjUvq7Lf7uwaGdgU-Wh2yNjUOnK_PrtcJnhIs8gzVuLoM6dXITIUOi-R3Qn0kGRI5g9Cew7IjJBVqvG5qjnEDDGIu0_dc8ZP8e3PW6"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#032a33] via-[#032a33]/90 to-[#032a33]/40 z-10"></div>
            <div className="relative z-20 p-5 w-full h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">Quality Guaranteed</span>
                </div>
                <h3 className="text-white text-lg font-black leading-tight mb-2">Certified Expert Technicians</h3>
                <p className="text-white/80 text-[10px] font-medium leading-relaxed max-w-[85%]">
                  Our professionals are trained, background-verified, and skilled in all major device brands.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><Shield className="w-2.5 h-2.5 text-white" /></div>
                  <span className="text-white text-[8px] font-black">No Fix No Fee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><Zap className="w-2.5 h-2.5 text-white" /></div>
                  <span className="text-white text-[8px] font-black">45 Min Arrival</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><Award className="w-2.5 h-2.5 text-white" /></div>
                  <span className="text-white text-[8px] font-black">Genuine Parts</span>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4 z-20 text-center flex flex-col items-center">
              <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Trusted By</span>
              <span className="text-[11px] font-black text-white leading-none">Crore+</span>
              <span className="text-[8px] font-bold text-slate-300 mb-1">Customers</span>
              <div className="flex gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="w-2 h-2 fill-current" />
                ))}
              </div>
            </div>
          </div>

          {/* 4 Feature Grid */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-indigo-50 rounded-[12px] flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-indigo-500" />
              </div>
              <h5 className="text-[10px] font-black text-slate-800 leading-tight mb-1">Verified Experts</h5>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Skilled & certified professionals</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-[12px] flex items-center justify-center mb-2">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <h5 className="text-[10px] font-black text-slate-800 leading-tight mb-1">Live Updates</h5>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">Get real-time updates on your repair</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-amber-50 rounded-[12px] flex items-center justify-center mb-2">
                <Tag className="w-5 h-5 text-amber-500" />
              </div>
              <h5 className="text-[10px] font-black text-slate-800 leading-tight mb-1">Transparent Pricing</h5>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">No hidden charges, what you see is what you pay</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-emerald-50 rounded-[12px] flex items-center justify-center mb-2">
                <Headset className="w-5 h-5 text-emerald-500" />
              </div>
              <h5 className="text-[10px] font-black text-slate-800 leading-tight mb-1">24/7 Support</h5>
              <p className="text-[8px] text-slate-500 leading-tight font-medium">We're here to help you anytime</p>
            </div>
          </div>

        </div>
      )}

      {/* STEP 2: PROBLEM DETAILS SCREEN */}
      {step === 2 && (() => {
        const renderBrandIcon = () => {
          if (!brand) return <Smartphone className="w-4 h-4 text-green-700" />;
          if (brand.toLowerCase() === 'apple') return <Apple className="w-4 h-4 text-green-700 fill-current" />;
          if (deviceCategory === 'Laptop') return <LaptopIcon className="w-4 h-4 text-green-700" />;
          if (deviceCategory === 'TV') return <Tv className="w-4 h-4 text-green-700" />;
          if (deviceCategory === 'Watch') return <Watch className="w-4 h-4 text-green-700" />;
          if (deviceCategory === 'Tablet') return <Tablet className="w-4 h-4 text-green-700" />;
          return <Smartphone className="w-4 h-4 text-green-700" />;
        };

        const renderModelIcon = () => {
          if (deviceCategory === 'Laptop') return <LaptopIcon className="w-4 h-4 text-teal-600" />;
          if (deviceCategory === 'TV') return <Tv className="w-4 h-4 text-teal-600" />;
          if (deviceCategory === 'Watch') return <Watch className="w-4 h-4 text-teal-600" />;
          if (deviceCategory === 'Tablet') return <Tablet className="w-4 h-4 text-teal-600" />;
          return <Smartphone className="w-4 h-4 text-teal-600" />;
        };

        const renderIssueIcon = () => {
          if (!issue) return <Zap className="w-4 h-4 text-orange-500" />;
          const l = issue.toLowerCase();
          if (l.includes('screen') || l.includes('display') || l.includes('glass')) {
            return (
              <>
                <Smartphone className="w-4 h-4 text-orange-500 relative z-10" />
                <Zap className="w-2.5 h-2.5 text-white absolute fill-orange-500 z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </>
            );
          }
          if (l.includes('battery') || l.includes('power') || l.includes('charge')) {
            return <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />;
          }
          return <Shield className="w-4 h-4 text-orange-500" />;
        };

        return (
          <div className="flex-1 flex flex-col justify-start animate-fadeIn pb-10">
            <h1 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">Tell us the problem</h1>
            <p className="text-sm text-slate-500 mb-8">Describe inputs to receive diagnostic estimation.</p>

            <div className="space-y-5">
              {/* Brand select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-800 ml-1">Select Brand</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shadow-sm">
                    {renderBrandIcon()}
                  </div>
                  <select
                    value={brand}
                    onChange={(e) => handleSelectBrand(e.target.value)}
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-14 pr-10 text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 shadow-sm"
                  >
                    <option value="" disabled>Choose a brand</option>
                    {currentBrands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Model Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-800 ml-1">Select Model</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shadow-sm">
                    {renderModelIcon()}
                  </div>
                  <select
                    value={model}
                    onChange={(e) => handleSelectModel(e.target.value)}
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-14 pr-10 text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 shadow-sm"
                  >
                    <option value="" disabled>Choose a model</option>
                    {currentModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Common Issues */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-800 ml-1">Select Primary Issue</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shadow-sm">
                    {renderIssueIcon()}
                  </div>
                  <select
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-14 pr-10 text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 shadow-sm"
                  >
                    <option value="" disabled>What happened?</option>
                    {issuesList.map((dmg) => (
                      <option key={dmg} value={dmg}>{dmg}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Text Area with Mic Simulation */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-800 ml-1">Problem Description</label>
                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder="Describe the issue in detail (e.g., green lines, coffee spill timeline)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full bg-white border border-[#004c4c]/30 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 resize-none pb-12 shadow-sm`}
                  />
                  <button
                    type="button"
                    onClick={handleSimulateVoice}
                    className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    title="Simulate speech translation"
                  >
                    {isListening ? <Mic className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 font-medium ml-1 flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  A detailed brief speeds up doorstep diagnostic.
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 h-14 border-2 border-[#004c4c] text-[#004c4c] bg-white font-black rounded-xl active:scale-95 transition-all text-sm flex justify-center items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button
                onClick={() => {
                  if (!brand || !model || !issue || !description.trim()) {
                    return;
                  }
                  setStep(3);
                }}
                disabled={!brand || !model || !issue || !description.trim()}
                className={`flex-1 h-14 font-black rounded-xl active:scale-95 transition-all text-sm flex justify-center items-center gap-2 shadow-md ${(!brand || !model || !issue || !description.trim())
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#004c4c] text-white hover:bg-[#003b3b]'
                  }`}
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* STEP 3: REPAIR LOGISTICS (IMAGE UPLOAD & ADDRESSES) */}
      {step === 3 && (
        <div className="flex-1 flex flex-col justify-start animate-fadeIn pb-10">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">Repair Logistics</h1>
            <p className="text-xs text-slate-500 mb-6 font-medium">Set your repair preferences</p>

            {/* Custom File/Image Uploader */}
            <div className="mb-6 space-y-2">
              <h3 className="text-[11px] font-extrabold text-slate-800 ml-1">Upload Images (Max 4)</h3>

              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleLocalFileChange}
                className="hidden"
              />

              <div className="flex gap-3 overflow-x-auto py-1 hide-scrollbar">
                {uploadedImages.map((item) => (
                  <div key={item.id} className="relative flex-none w-[90px] h-[90px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={item.url} alt="Uploaded diagnostic" className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(item.id);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 active:scale-90 transition-transform"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {uploadedImages.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-none w-[90px] h-[90px] bg-slate-50 border border-slate-100 hover:border-emerald-200 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center bg-white text-slate-600 mb-1">
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-700">Add More</span>
                  </button>
                )}
              </div>
            </div>

            {/* Address selecting */}
            <div className="mb-6 space-y-2">
              <h3 className="text-[11px] font-extrabold text-slate-800 ml-1">Service Address</h3>

              {selectedAddressId ? (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Home className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">
                        {addressesList.find(a => String(a.id) === selectedAddressId)?.label || 'Home'}
                      </h4>
                      <button
                        onClick={() => setSelectedAddressId('')}
                        className="text-emerald-600 text-[11px] font-extrabold hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed truncate">
                      {addressesList.find(a => String(a.id) === selectedAddressId)?.address_line1},
                      {addressesList.find(a => String(a.id) === selectedAddressId)?.city},
                      {addressesList.find(a => String(a.id) === selectedAddressId)?.state} {addressesList.find(a => String(a.id) === selectedAddressId)?.pincode}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 hide-scrollbar">
                  {addressesList.length > 0 ? (
                    addressesList.map((item) => {
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedAddressId(String(item.id))}
                          className={`p-4 bg-white rounded-2xl border text-xs leading-relaxed shadow-sm flex gap-3 items-start transition-all cursor-pointer hover:border-emerald-200 border-slate-200`}
                        >
                          <div className={`p-2 rounded-lg mt-0.5 transition-all text-slate-400 bg-slate-100`}>
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-extrabold text-slate-800 flex items-center gap-1 mb-1 text-sm">
                              {item.label}
                            </p>
                            <p className="text-slate-500 font-medium text-xs leading-relaxed mt-1">
                              <span className="font-bold text-slate-700">{item.full_name}</span> ({item.mobile_number})<br />
                              {item.address_line1}{item.address_line2 ? `, ${item.address_line2}` : ''}
                              {item.landmark ? ` [Landmark: ${item.landmark}]` : ''}, {item.city}, {item.state} - {item.pincode}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 italic mb-2">No addresses saved yet.</p>
                      <button
                        type="button"
                        onClick={() => setShowAddressChoiceModal(true)}
                        className="px-4 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg"
                      >
                        Add Address
                      </button>
                    </div>
                  )}
                  {addressesList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressChoiceModal(true)}
                      className="w-full py-3 bg-slate-50 border border-slate-200 border-dashed text-emerald-600 text-xs font-bold rounded-2xl flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add New Address
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Estimate Budget */}
            <div className="mb-6 space-y-2">
              <h3 className="text-[11px] font-extrabold text-slate-800 ml-1">Estimate Budget</h3>
              <div className="relative">
                <select
                  value={priceTier}
                  onChange={(e) => setPriceTier(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
                  <option value="Up to ₹2499 (Gold)">Up to ₹2499 (Gold)</option>
                  <option value="₹999 - ₹1499 (Silver)">₹999 - ₹1499 (Silver)</option>
                </select>
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center transition-all">
                  <h4 className="text-[13px] font-extrabold text-slate-900">{priceTier}</h4>
                  <div className="flex items-center gap-2">
                    {priceTier === 'Up to ₹2499 (Gold)' && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase tracking-wider hidden sm:block">
                        Recommended
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action trigger footer */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setStep(2)}
              className="flex-[0.8] h-12 bg-white border border-slate-200 text-slate-700 font-extrabold rounded-[16px] active:scale-95 transition-all text-[13px] shadow-sm"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!selectedAddressId) {
                  if (addressesList.length > 0) setSelectedAddressId(String(addressesList[0].id));
                }
                // Removed hardcoded setPriceTier to preserve user's selection
                setStep(4);
              }}
              className="flex-[1.2] h-12 font-extrabold rounded-[16px] active:scale-95 transition-all text-[13px] shadow-md bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 4 && (
        <div className="flex-1 flex flex-col justify-between animate-fadeIn">
          <div>
            <h1 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Confirm Booking</h1>
            <p className="text-sm text-slate-500 mb-6">Review your repair details before finalizing.</p>

            <div className="space-y-4">
              {/* Main Bento Info card */}
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#006666]/10 rounded-lg text-[#006666]">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Device Model
                    </p>
                    <p className="text-sm font-extrabold text-slate-900">{brand} {model}</p>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100 my-4" />

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400">Problem Type</p>
                        <p className="text-sm font-bold text-slate-800">{issue}</p>
                      </div>
                    </div>
                    <span className="bg-[#E9F6F6] text-[#006666] text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider font-sans">
                      {priorityLevel()} Priority
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400">Repair Location</p>
                      <p className="text-xs text-slate-700 leading-tight">
                        {getSelectedAddressText()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400">Scheduled Date</p>
                      <p className="text-sm text-slate-700">
                        {new Date().toLocaleDateString()} (Today)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded images slider review */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-black text-slate-700">Uploaded Images</h3>
                  <span className="text-[10px] text-slate-400 font-bold">{uploadedImages.length} Files</span>
                </div>
                {uploadedImages.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {uploadedImages.map((item, idx) => (
                      <div key={item.id} className="flex-none w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                        <img className="w-full h-full object-cover" src={item.url} alt="Submitting check" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic ml-1">No diagnostic photos selected.</p>
                )}
              </div>

              {/* Estimation banner card */}
              <div className="bg-[#006666] text-white rounded-xl p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-300" />
                  <div>
                    <p className="text-[9px] font-black text-teal-100 uppercase tracking-widest leading-none mb-1">
                      Selected Budget Tier
                    </p>
                    <p className="text-lg font-black tracking-tight">
                      {priceTier || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Booking Submit buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep(3)}
              className="flex-1 h-12 border border-slate-300 text-slate-600 font-bold rounded-xl active:scale-95 transition-all text-sm"
            >
              Back
            </button>
            <button
              onClick={handleFinalSubmit}
              className="flex-[2] h-12 font-black rounded-xl active:scale-95 transition-all text-sm shadow-md bg-[#004c4c] text-white shadow-teal-900/10"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}

      {/* MODAL WINDOW FOR ADDRESS CHOICE */}
      {showAddressChoiceModal && (
        <div className="absolute -top-32 -left-5 -right-5 -bottom-28 bg-slate-900/65 backdrop-blur-xs flex items-end justify-center z-[99999]">
          <div className="bg-white rounded-t-[32px] p-6 pb-32 w-full shadow-[0_-8px_30px_rgb(0,0,0,0.1)] animate-[slideUp_0.3s_ease-out]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Add New Address</h3>
              <button
                type="button"
                onClick={() => setShowAddressChoiceModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full bg-slate-50 border border-slate-200 active:scale-95 transition-all"
              >
                <X className="h-4 w-4 text-slate-500" strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-3 pb-4">
              <button
                onClick={() => {
                  setShowAddressChoiceModal(false);
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const res = await createAddress(token, {
                          label: 'Current Location',
                          full_name: 'Sanjay G',
                          mobile_number: '9876543210',
                          address_line1: '123 Auto-Detected Street',
                          address_line2: 'Near GPS Coordinates',
                          landmark: '',
                          city: 'Salem',
                          state: 'Tamil Nadu',
                          pincode: '636001',
                          latitude: pos.coords.latitude,
                          longitude: pos.coords.longitude,
                          is_active: 1
                        });

                        if (res.success) {
                          if (res.data) {
                            setAddressesList(prev => [res.data, ...prev]);
                            setSelectedAddressId(String(res.data.id));
                          }
                        } else {
                          navigate('/customer/alert?message=' + encodeURIComponent(res.message || "Failed to save live location") + '&type=error');
                        }
                      },
                      () => {
                        navigate('/customer/alert?message=' + encodeURIComponent("Location access denied or unavailable.") + '&type=error');
                      }
                    );
                  } else {
                    navigate('/customer/alert?message=' + encodeURIComponent("Geolocation not supported by browser.") + '&type=error');
                  }
                }}
                className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-[20px] flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                  <Navigation className="h-5 w-5 fill-white" />
                </div>
                <div className="text-left flex-1">
                  <h4 className="text-sm font-extrabold text-slate-900">Use Live Location</h4>
                  <p className="text-[10px] font-medium text-emerald-700 mt-0.5">Auto-detect your current address</p>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-500" />
              </button>

              <button
                onClick={() => {
                  setShowAddressChoiceModal(false);
                  setShowAddressModal(true);
                  setShowMap(false);
                }}
                className="w-full p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-[20px] flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                  <PenLine className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="text-left flex-1">
                  <h4 className="text-sm font-extrabold text-slate-900">Enter Manually</h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">Type out your complete address</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WINDOW TO ADD NEW ADDRESS */}
      {showAddressModal && (
        <div className="absolute -top-32 -left-5 -right-5 -bottom-28 bg-slate-900/65 backdrop-blur-xs flex items-end justify-center z-[99999] overflow-hidden">
          <div className="bg-white rounded-t-[32px] p-6 pb-32 w-full shadow-2xl animate-[slideUp_0.3s_ease-out] max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-sm font-black text-slate-900">Add New Doorstep Address</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="overflow-y-auto hide-scrollbar flex-1 -mx-2 px-2">
              <form onSubmit={handleSaveNewAddress} className="space-y-3 pb-4">
                {/* Select on Map */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Select on Map</label>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="w-full py-2 bg-[#E9F6F6] text-[#004c4c] text-[10px] font-black rounded-lg border border-teal-100 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                  >
                    <MapIcon className="h-3.5 w-3.5" /> {showMap ? 'Hide Map' : 'Open Map for Live Location'}
                  </button>
                </div>

                {showMap && (
                  <div className="mb-2">
                    <MapSelector onLocationSelect={handleLocationSelect} />
                    {autofilled && (
                      <div className="mt-2 p-1.5 bg-emerald-50 border border-emerald-100 rounded-lg animate-fadeIn">
                        <p className="text-[9px] text-emerald-600 font-black text-center uppercase tracking-wider">
                          ✨ Address fields autofilled
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Label selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Label Identifier</label>
                  <div className="flex gap-2">
                    {['Home', 'Work', 'Other'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setNewAddrLabel(lbl)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${newAddrLabel === lbl ? 'bg-[#004c4c] text-white border-transparent' : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                          }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newAddrFullName}
                    onChange={(e) => setNewAddrFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                  />
                </div>

                {/* Mobile Number */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={newAddrMobile}
                    onChange={(e) => setNewAddrMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                  />
                </div>

                {/* Address Line 1 */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat/House No., Building, Street"
                    value={newAddrLine1}
                    onChange={(e) => setNewAddrLine1(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                  />
                </div>

                {/* Address Line 2 */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Apartment, Area, Sector"
                    value={newAddrLine2}
                    onChange={(e) => setNewAddrLine2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                  />
                </div>

                {/* Landmark */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near City Mall"
                    value={newAddrLandmark}
                    onChange={(e) => setNewAddrLandmark(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                  />
                </div>

                {/* City & State (Grid) */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Salem"
                      value={newAddrCity}
                      onChange={(e) => setNewAddrCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Indiana"
                      value={newAddrState}
                      onChange={(e) => setNewAddrState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Pincode / Zip Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 636001"
                    value={newAddrPincode}
                    onChange={(e) => setNewAddrPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-250"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold bg-[#004c4c] text-white rounded-lg transition-colors"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showRewardWheel && (
        <RewardWheelModal
          onClose={() => navigate('/customer/repairs')}
          onRewardClaimed={(reward) => {
            if (confirmedBookingId) {
              const storedStr = localStorage.getItem('mock_repairs');
              if (storedStr) {
                const repairs = JSON.parse(storedStr);
                const idx = repairs.findIndex((r: any) => r.id === confirmedBookingId);
                if (idx !== -1) {
                  repairs[idx].reward = reward;
                  localStorage.setItem('mock_repairs', JSON.stringify(repairs));
                }
              }
            }
            navigate('/customer/repairs');
          }}
        />
      )}
    </div>
  );
}
