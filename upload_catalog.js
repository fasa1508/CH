// upload_catalog.js
// Script Node.js para subir la carpeta Catalog/* a Supabase Storage y crear productos en la DB.
// Requisitos:
// 1) Crear un archivo .env con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
// 2) npm install @supabase/supabase-js dotenv fs-extra

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!SUPABASE_URL || !SERVICE_ROLE){
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

const CATALOG_DIR = path.join(__dirname, 'Catalog');

async function ensureCategory(name){
  // For simplicity store categories as text in products; you may wish to insert into categories table
  return name;
}

async function uploadFile(category, filePath){
  const fileName = path.basename(filePath);
  const dest = `${category}/${Date.now()}_${fileName}`;
  const fileBuffer = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage.from('images').upload(dest, fileBuffer, { upsert: false });
  if(error){ console.error('Upload error', error); return null; }
  const { publicURL } = supabase.storage.from('images').getPublicUrl(dest);
  return publicURL;
}

async function createProductRecord({ name, description, price, category, image_url }){
  const { data, error } = await supabase.from('products').insert([{ name, description, price, category, image_url }]);
  if(error){ console.error('Insert error', error); }
  return data;
}

async function walkAndUpload(){
  if(!fs.existsSync(CATALOG_DIR)){ console.error('Catalog folder not found at', CATALOG_DIR); return; }
  const categories = fs.readdirSync(CATALOG_DIR).filter(f => fs.statSync(path.join(CATALOG_DIR,f)).isDirectory());
  for(const cat of categories){
    const catPath = path.join(CATALOG_DIR, cat);
    const files = fs.readdirSync(catPath).filter(f => f.match(/\.(jpg|jpeg|png|webp|gif)$/i));
    for(const file of files){
      const full = path.join(catPath, file);
      console.log('Uploading', full);
      const url = await uploadFile(cat, full);
      if(url){
        const name = path.parse(file).name;
        await createProductRecord({ name, description: '', price: 0, category: cat, image_url: url });
        console.log('Created product for', file);
      }
    }
  }
}

walkAndUpload().then(()=>{ console.log('Done'); }).catch(err=>{ console.error(err); });
