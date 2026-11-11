/* =========================================================
   EDIT THESE DETAILS
   Business info, the car list and customer reviews.
   ========================================================= */
const BUSINESS = {
  name: "Ady’s Wedding Car",
  whatsapp: "94767990046",          // bookings go to this WhatsApp number (country code, no +)
  phone: "+94 76 799 0046",
  address: "Karawitagara, Chilaw",
  bank: { account: "2000499099", holder: "R.A.Lakshan", bank: "Commercial Bank", branch: "Chilaw Branch" }
};

// Google Sheet booking helper (the Web app URL that ends in /exec)
const BOOKINGS_URL = "https://script.google.com/macros/s/AKfycbxxrYM5fSXpa2q_Iw25bPqDlWTzeuPFm3p8piM2OV1cRMm3fxDT8ygHu-sBEkbbmK2nGw/exec";


// Cars shown in the gallery and the vehicle list. Add photo URLs to "photos".
const VEHICLES = [
  { id: "ford", name: { en: "FORD RAPTOR", si: "FORD RAPTOR" }, photos: ["images/cars/ford.jpg"] },
  { id: "vezel", name: { en: "Vezel", si: "Vezel" }, photos: ["images/cars/vezel.jpg"] },
  { id: "bmw520d", name: { en: "BMW 520d", si: "BMW 520d" }, photos: ["images/cars/bmw.jpg" , "images/cars/bmwb.jpg"] },
  { id: "bmw318", name: { en: "BMW 318i", si: "BMW 318i" }, photos: [ "images/cars/318.jpg"] },
  { id: "chr", name: { en: "CHR", si: "CHR" }, photos: ["images/cars/c .jpg" , "images/cars/chrr.jpg"] },
  { id: "civic", name: { en: "Honda Civic", si: "Honda Civic" }, photos: ["images/cars/civic.jpg"] },
  { id: "audi", name: { en: "Audi A5", si: "Audi A5" }, photos: ["images/cars/audi.jpg"] },
  { id: "prius", name: { en: "Toyota Prius", si: "Toyota Prius" }, photos: ["images/cars/pr.jpg"] },
  { id: "benze300", name: { en: "Mercedes - Benz - E300", si: "Mercedes - Benz - E300" }, photos: ["images/cars/b3.jpg"] },
  { id: "benzc200", name: { en: "Mercedes - Benz - C200", si: "Mercedes - Benz - C200" }, photos: ["images/cars/b2.jpg"] },
  { id: "benzc200", name: { en: "Benz C-Class Cabriolet", si: "Benz C-Class Cabriolet" }, photos: ["images/cars/bb.jpg", "images/cars/bbw.jpg"] },
  { id: "prado150", name: { en: "Prado 150", si: "Prado 150" }, photos: ["images/cars/p .jpg"] },
  { id: "prado250", name: { en: "Prado 250", si: "Prado 250" }, photos: ["images/cars/250.jpg"] },
  { id: "sahara", name: { en: "Land Cruiser V8", si: "Land Cruiser V8" }, photos: ["images/cars/sahara.jpg"] },
  { id: "limousine", name: { en: "Chrysler limousine (Rolls-Royce Phantom-style body kit)", si: "Chrysler limousine (Rolls-Royce Phantom-style body kit)" }, photos: ["images/cars/l.jpg"] },
  { id: "limousine2", name: { en: "Chrysler limousine", si: "Chrysler limousine" }, photos: ["images/cars/l2.jpg"] },
  { id: "limousine3", name: { en: "Prado limousine", si: "Prado limousine" }, photos: ["images/cars/l3.jpg"] },
  { id: "defender", name: { en: "Land Rover Defender", si: "Land Rover Defender" }, photos: ["images/cars/b .jpg", "images/cars/bw.jpg"] },
  { id: "other", name: { en: "Other (tell us in your notes)", si: "වෙනත් (සටහනේ සඳහන් කරන්න)" }, gallery: false }
];

