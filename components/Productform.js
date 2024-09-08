import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";


export default function ProductForm({
    _id,
    title:existingTitle,
    description:existingDescription,
    price:existingPrice,
    images:existingImages,
}){
    const [title, setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription || '');
    const [price, setPrice] = useState(existingPrice || '');
    const [images, setImages] = useState(existingImages || []);
    const [goToProducts, setGoToProducts] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();
    async function saveProduct(ev){
        ev.preventDefault();
        const data = {title,description, price, images}; 
        if (_id){
            await axios.put('/api/products', {...data,_id});

        }else{
            await axios.post('/api/products', data);
        }
        setGoToProducts(true);
    }
    if (goToProducts){
        router.push('/products');
    }
    async function uploadImages(ev){
        const files = ev.target?.files;
        if(files?.length>0){
            setIsUploading(true);
            const data = new FormData();
            for (const file of files){
                data.append('file', file);
            };
            const res = await axios.post('/api/upload',data);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            });
            setIsUploading(false);
        }
    }
    function updateImagesOrder(images){
        setImages(images);
    };
    return (
            <form onSubmit={saveProduct} className="product-form">
            
            <label>Product Name</label>
            <input type="text" placeholder="product name" value={title} onChange={ev=> setTitle(ev.target.value)}/>

            <label>Photos</label>
            <div className="mb-2 flex-wrap gap-1">
                <ReactSortable list={images} className="flex flex-wrap gap-1" setList={updateImagesOrder}>
                {!!images?.length && images.map(link => (
                    <div key={link} className="h-24">
                        <img src={link} alt="" className="rounded-lg"/>
                    </div>
                ))}
                </ReactSortable>
                {isUploading && (
                    <div className="h-24 flex items-center"><Spinner/></div>
                )}
                <label className="size-24 cursor-pointer flex text-center flex-col items-center justify-center text-sm gap-1 text-gray-500 rounded-md bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <input type="file" onChange={uploadImages} className="hidden"/>
                </label>
            </div>

            
            <label>Description</label>
            <textarea placeholder="description" value={description} onChange={ev=> setDescription(ev.target.value)}></textarea>
            
            <label>Price (in USD)</label>
            <input type="text" placeholder="price" value={price} onChange={ev=> setPrice(ev.target.value)}/>
            
            <button type="submit" className="btn-primary">Save</button>
            </form>
    );
}