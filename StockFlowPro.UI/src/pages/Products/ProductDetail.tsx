import { useParams } from "react-router-dom";

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Product Detail
                </h1>
                <p className="mt-1 text-sm text-gray-500">Product ID: {id}</p>
            </div>

            <div className="card">
                <p className="text-gray-600">
                    Product detail page coming soon...
                </p>
            </div>
        </div>
    );
};

export default ProductDetail;
