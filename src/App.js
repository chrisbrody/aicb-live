import React, { useState } from 'react';
import axios from 'axios';

const ColoringBookPrompt = () => {
    const [prompt, setPrompt] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!prompt) return alert('Please enter a prompt.');
        if (images.length >= 3) return alert('You have reached the maximum number of images.');

        setLoading(true);
        setError(null);

        try {
            const enhancedPrompt = `${prompt}, simple line drawing, black and white, coloring book style, clean lines, minimalistic design`;

            const response = await axios.post(
                'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
                {
                    inputs: enhancedPrompt,
                    parameters: {
                        negative_prompt: "color, shading, realistic, detailed, complexity, texture, gradients",
                        num_inference_steps: 30,
                        guidance_scale: 7.5,
                        height: 512,
                        width: 512,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    responseType: 'arraybuffer',
                }
            );

            const blob = new Blob([response.data], { type: 'image/png' });
            const imageUrl = URL.createObjectURL(blob);

            setImages([...images, imageUrl]);
        } catch (error) {
            console.error('Error generating image:', error);
            setError(error.response?.data?.error || 'Failed to generate image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Sample Generator</h1>
            <div className="input-container">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your image..."
                    className="input-field"
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading || images.length >= 3}
                    className={`generate-button ${loading ? 'loading' : ''} ${images.length >= 3 ? 'disabled' : ''}`}
                >
                    {loading ? 'Generating...one moment' : images.length >= 3 ? 'Max Images Reached' : 'Generate Image'}
                </button>

            </div>
            {error && (
                <div className="error-message">Error: {error}</div>
            )}

            {images.length > 0 && (
                <>
                    <h2>Generated Images:</h2>
                    <div className="image-container">
                        {images.map((image, index) => (
                            <div key={index} className="image-box">
                                <img src={image} alt={`Coloring Book Page ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </>
            )}
            {images.length >= 3 && (
                <div className="overlay">
                    <div className="modal">
                        <h2>Review Coloring Book</h2>
                        <div className="button-group">
                            <button
                                onClick={() => alert('Reviewing coloring book!')}
                                className="review-button"
                            >
                                Review
                            </button>
                            <button
                                onClick={() => alert('Proceeding to purchase!')}
                                className="purchase-button"
                            >
                                Purchase
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ColoringBookPrompt;