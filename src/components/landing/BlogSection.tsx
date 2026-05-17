'use client'

import { motion } from 'framer-motion'

interface Article {
  title: string
  badge: string
  badgeColor: 'green' | 'orange' | 'navy'
  excerpt: string
  href: string
}

const articles: Article[] = [
  {
    title: 'Sécuriser vos colis : 5 bonnes pratiques pour le transport inter-villes',
    badge: 'Sécurité',
    badgeColor: 'green',
    excerpt:
      'Découvrez comment les codes QR et la traçabilité numérique réduisent les pertes et les litiges lors du transport de marchandises entre villes au Sénégal.',
    href: '#',
  },
  {
    title: 'Optimiser vos tournées de livraison avec la technologie',
    badge: 'Productivité',
    badgeColor: 'orange',
    excerpt:
      "La bonne gestion des itinéraires et le suivi en temps réel permettent aux chauffeurs et agences de gagner du temps et d'améliorer leur rentabilité.",
    href: '#',
  },
  {
    title: 'Réglementation du transport de marchandises au Sénégal',
    badge: 'Conformité',
    badgeColor: 'navy',
    excerpt:
      'Un guide complet sur les obligations légales, les documents requis et les normes à respecter pour le transport inter-villes de marchandises.',
    href: '#',
  },
]

const badgeStyles: Record<Article['badgeColor'], string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  navy: 'bg-blue-50 text-blue-700 border-blue-200',
}

const topBarColors: Record<Article['badgeColor'], string> = {
  green: 'bg-emerald-500',
  orange: 'bg-[#FF6B35]',
  navy: 'bg-[#0A2540]',
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function BlogSection() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A2540]">
            Ressources &amp; Bonnes Pratiques Logistiques
          </h2>
        </motion.div>

        {/* Articles Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {articles.map((article) => (
            <motion.a
              key={article.title}
              variants={cardVariants}
              href={article.href}
              className="group block bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Colored Top Bar */}
              <div className={`h-1 ${topBarColors[article.badgeColor]}`} />

              <div className="p-6 sm:p-8">
                {/* Badge */}
                <span
                  className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border mb-4 ${badgeStyles[article.badgeColor]}`}
                >
                  {article.badge}
                </span>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-[#0A2540] mb-3 group-hover:text-[#1A3A52] transition-colors line-clamp-2">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                {/* Read Link */}
                <span className="inline-flex items-center text-sm font-semibold text-[#FF6B35] group-hover:gap-2 transition-all duration-200">
                  Lire
                  <span className="ml-1 group-hover:ml-2 transition-all duration-200">&rarr;</span>
                </span>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
