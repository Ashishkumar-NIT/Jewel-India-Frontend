"use client";
// import { useEffect } from "react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

/*
const CITY_MAP = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Naharlagun", "Pasighat", "Ziro"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Raigarh"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Rohtak", "Hisar"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad"],
  "Manipur": ["Imphal", "Thoubal", "Kakching", "Ukhrul", "Bishnupur"],
  "Meghalaya": ["Shillong", "Tura", "Nongpoh", "Jowai", "Baghmara"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
  "Sikkim": ["Gangtok", "Namchi", "Mangan", "Geyzing", "Singtam"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Ghaziabad"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Rishikesh", "Haldwani"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi"]
};

function getCitiesByState(state) {
  if (!state) return [];
  return CITY_MAP[state] || [`${state} City 1`, `${state} City 2`, `${state} City 3`];
}
*/

export function BusinessForm({
  businessName, setBusinessName,
  selectedState, setSelectedState,
  selectedCity, setSelectedCity,
  cities, setCities,
  submitAttempted
}) {
  const isNameError = submitAttempted && businessName.trim().length < 2;
  const isStateError = submitAttempted && selectedState === "";
  const isCityError = submitAttempted && selectedCity === "";

  /*
  useEffect(() => {
    if (selectedState) {
      setCities(getCitiesByState(selectedState));
      setSelectedCity("");
    }
  }, [selectedState, setCities, setSelectedCity]);
  */

  return (
    <div className="flex flex-col gap-[clamp(16px,2vw,24px)] w-full">
      <div className="flex flex-row gap-[clamp(8px,1.5vw,24px)] w-full">
        <div className="w-full md:w-[58%] md:flex-none flex flex-col gap-2 min-w-0">
          <label htmlFor="businessName" className="text-[13px] font-semibold text-[#374151]">Business name*</label>
          <input
            id="businessName"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Pc jewellers"
            className={`w-full bg-[#F5F5F5] rounded-[8px] outline-none px-[clamp(10px,1.5vw,16px)] py-[clamp(8px,1.2vw,14px)] text-[clamp(13px,1.4vw,15px)] text-[#374151] placeholder:text-[#9CA3AF] transition-shadow ${isNameError ? 'border-[1.5px] border-[#EF4444]' : 'border-none focus:ring-2 focus:ring-black/10'}`}
          />
          {isNameError && <span className="text-[12px] text-[#EF4444]">Business name is required</span>}
        </div>
        {/* Empty column to force Business Name to stop at precise horizontal threshold */}
        <div className="flex-1 min-w-0 hidden md:block"></div>
      </div>

      <div className="flex flex-row gap-[clamp(8px,1.5vw,24px)] w-full">
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <label htmlFor="state" className="text-[13px] font-semibold text-[#374151]">State*</label>
          <div className="relative">
            <select
              id="state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className={`w-full appearance-none bg-[#FFFFFF] rounded-[8px] border outline-none px-[clamp(10px,1.5vw,16px)] py-[clamp(8px,1.2vw,14px)] text-[clamp(13px,1.4vw,15px)] text-[#374151] transition-shadow cursor-pointer ${isStateError ? 'border-[#EF4444]' : 'border-[#E5E7EB] focus:ring-2 focus:ring-black/10'}`}
            >
              <option value="" disabled className="text-[#9CA3AF]">select</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 ${selectedState ? 'text-[#374151]' : 'text-[#9CA3AF]'}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[clamp(12px,1.5vw,16px)] h-[clamp(12px,1.5vw,16px)]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          {isStateError && <span className="text-[12px] text-[#EF4444]">Please select a state</span>}
        </div>

        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <label htmlFor="city" className="text-[13px] font-semibold text-[#374151]">City*</label>
          <div className="relative">
            <input
              id="city"
              type="text"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedState}
              placeholder="select"
              className={`w-full rounded-[8px] border outline-none px-[clamp(10px,1.5vw,16px)] py-[clamp(8px,1.2vw,14px)] text-[clamp(13px,1.4vw,15px)] text-[#374151] placeholder:text-[#9CA3AF] transition-shadow ${!selectedState ? 'bg-[#F9FAFB] border-[#E5E7EB] cursor-not-allowed opacity-80' : isCityError ? 'bg-[#FFFFFF] border-[#EF4444]' : 'bg-[#FFFFFF] border-[#E5E7EB] focus:ring-2 focus:ring-black/10'}`}
            />
          </div>
          {isCityError && <span className="text-[12px] text-[#EF4444]">Please enter a city</span>}
        </div>
      </div>
    </div>
  );
}
