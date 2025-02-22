'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FaInstagram, FaFacebook, FaWhatsapp, FaTiktok } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create the mailto URL with the form data
    const subject = encodeURIComponent('Contacto desde Tabascomiendo');
    const body = encodeURIComponent(
      `Nombre: ${formData.name}\n` +
        `Email: ${formData.email}\n\n` +
        `Mensaje:\n${formData.message}`
    );

    // Open the mailto link
    window.location.href = `mailto:tabascomiendo@gmail.com?subject=${subject}&body=${body}`;

    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contáctanos</h1>
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              ¿Tienes alguna pregunta o sugerencia? Nos encantaría escucharte.
            </p>
            <p className="text-lg text-gray-600">
              Si deseas modificar o agregar tu restaurante a Tabascomiendo, o
              tienes cualquier propuesta de negocio, no dudes en contactarnos.
              Estamos aquí para ayudarte a hacer crecer tu negocio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mensaje
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="¿En qué podemos ayudarte?"
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                Enviar mensaje
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Información de contacto
              </h2>
              <div className="space-y-4">
                <p className="flex items-center space-x-2">
                  <span className="font-medium">Email:</span>
                  <a
                    href="mailto:tabascomiendo@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    tabascomiendo@gmail.com
                  </a>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="font-medium">WhatsApp:</span>
                  <a
                    href="https://wa.me/+5215613691724"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    +52 561 369 1724
                  </a>
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Síguenos en redes sociales
              </h2>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/tabascomiendo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700"
                >
                  <FaInstagram className="text-3xl" />
                </a>
                <a
                  href="https://www.facebook.com/tabascomiendo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <FaFacebook className="text-3xl" />
                </a>
                <a
                  href="https://www.tiktok.com/@tabascomiendo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <FaTiktok className="text-3xl" />
                </a>
                <a
                  href="https://wa.me/+5215613691724"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700"
                >
                  <FaWhatsapp className="text-3xl" />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
