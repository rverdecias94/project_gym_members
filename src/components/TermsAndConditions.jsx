import { Typography, Container, Paper, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const TermsAndConditions = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
            }}
          >
            Términos y Condiciones de Uso – Tronoss
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.secondary,
              fontStyle: 'italic',
            }}
          >
            Versión 1.0 | Última actualización: {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            mb: 3,
            lineHeight: 1.7,
            color: theme.palette.text.primary,
          }}
        >
          Bienvenido a <strong>Tronoss</strong>, una plataforma digital desarrollada con el objetivo de apoyar la gestión de gimnasios y tiendas de suplementos en Cuba. Al acceder o utilizar nuestra aplicación, aceptas los siguientes Términos y Condiciones. Te recomendamos leerlos detenidamente antes de continuar.
        </Typography>

        {/* Sección 1 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            1. Aceptación de los términos
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: theme.palette.text.primary }}>
            El uso de Tronoss implica tu aceptación expresa y voluntaria de los presentes Términos y Condiciones. Si no estás de acuerdo, no debes utilizar la plataforma.
          </Typography>
        </Box>

        {/* Sección 2 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            2. Descripción del servicio
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: theme.palette.text.primary, mb: 2 }}>
            Tronoss ofrece un sistema de gestión de miembros dirigido a gimnasios y una herramienta de gestión de productos para tiendas relacionadas al ámbito fitness. Las funcionalidades incluyen:
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: theme.palette.text.primary }}>
            <li>Registro y control de pagos de miembros.</li>
            <li>Estadísticas básicas (cantidad de miembros, género, etc.).</li>
            <li>Gestión de productos y ventas para tiendas y gimnasios.</li>
            <li>Envío de notificaciones externas vía WhatsApp para recordatorios o avisos.</li>
          </Box>
        </Box>

        {/* Sección 3 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            3. Tipos de usuarios
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: theme.palette.text.primary, mb: 2 }}>
            Existen tres tipos de usuarios dentro de Tronoss:
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: theme.palette.text.primary }}>
            <li><strong>Tipo Gym:</strong> gimnasios que utilizan la plataforma para gestionar sus miembros.</li>
            <li><strong>Tipo Tienda:</strong> comercios que gestionan sus productos y ventas.</li>
            <li><strong>Tipo Miembro:</strong> usuarios registrados como miembros de un gimnasio o clientes de una tienda.</li>
          </Box>
        </Box>

        {/* Sección 4 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            4. Registro y uso de la plataforma
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: theme.palette.text.primary }}>
            <li>El acceso a funciones administrativas está reservado a usuarios tipo Gym y tipo Tienda, previo registro y aprobación.</li>
            <li>El acceso como Miembro es gratuito, pero su información es gestionada por el gimnasio o tienda correspondiente.</li>
            <li>Es responsabilidad de cada usuario proporcionar datos verídicos, actualizados y completos.</li>
          </Box>
        </Box>

        {/* Sección 5 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            5. Costos y pagos
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: theme.palette.text.primary }}>
            <li>El uso de la app por parte de los usuarios tipo Miembro es completamente gratuito. No obstante, si el usuario asiste a un gimnasio, deberá realizar el pago correspondiente directamente a dicho gimnasio, según sus condiciones establecidas. Del mismo modo, cualquier compra realizada dentro de la app deberá ser abonada a la tienda correspondiente. En ambos casos, los pagos están sujetos a los términos y condiciones definidos por cada proveedor del servicio.</li>
            <li>Tronoss cobra una mensualidad a los usuarios tipo Gym y tipo Tienda por el uso de la plataforma. En caso de incumplimiento en el pago, la cuenta será desactivada de forma automática hasta que se regularice la situación y se complete el pago correspondiente.</li>
            <li>Los pagos deberán realizarse según las condiciones acordadas dentro de la app o por vía directa con el equipo de Tronoss.</li>
          </Box>
        </Box>

        {/* Sección 6 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            6. Uso adecuado y prohibiciones
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: theme.palette.text.primary, mb: 2 }}>
            Queda prohibido:
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: theme.palette.text.primary }}>
            <li>Utilizar Tronoss para fines distintos a los establecidos.</li>
            <li>Compartir datos de acceso con terceros sin autorización.</li>
            <li>Infringir normas legales o dañar el funcionamiento de la plataforma.</li>
          </Box>
        </Box>

        {/* Sección 7 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            7. Limitación de responsabilidad
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: theme.palette.text.primary, mb: 1 }}>
            Tronoss <strong>no se responsabiliza por la calidad de los productos o servicios ofrecidos por gimnasios o tiendas</strong> dentro de la plataforma, ni por el cumplimiento de pagos entre las partes.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: theme.palette.text.primary }}>
            Tampoco se responsabiliza por consecuencias relacionadas con el uso indebido de la plataforma o por decisiones tomadas a partir de la información gestionada.
          </Typography>
        </Box>

        {/* Sección 8 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            8. Protección de datos
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: theme.palette.text.primary }}>
            <li>Tronoss recopila y almacena información personal de los usuarios con el único fin de facilitar la administración por parte de gimnasios y tiendas en caso de necesitarlos.</li>
            <li>No compartimos esta información con terceros.</li>
            <li>Los datos son gestionados cumpliendo con principios de confidencialidad y seguridad razonables.</li>
          </Box>
        </Box>

        {/* Sección 9 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            9. Propiedad intelectual
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: theme.palette.text.primary, mb: 1 }}>
            Todos los derechos de propiedad intelectual sobre la plataforma, diseño, marca <b>Tronoss</b> y su contenido son propiedad exclusiva de sus creadores.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: theme.palette.text.primary }}>
            No está permitido copiar, distribuir ni modificar ningún elemento sin autorización previa por escrito.
          </Typography>
        </Box>

        {/* Sección 10 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            10. Suspensión y cancelación
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: theme.palette.text.primary }}>
            Nos reservamos el derecho a suspender o cancelar cuentas que infrinjan estos términos, que estén inactivas o que presenten conductas inapropiadas.
          </Typography>
        </Box>

        {/* Sección 11 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            11. Cambios en los términos
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: theme.palette.text.primary }}>
            Tronoss podrá modificar estos Términos y Condiciones en cualquier momento. Te notificaremos de los cambios relevantes a través de la plataforma o por canales de contacto disponibles.
          </Typography>
        </Box>

        {/* Sección 12 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            12. Contacto
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: theme.palette.text.primary }}>
            Si tienes dudas, sugerencias o deseas reportar un uso indebido, puedes contactarnos a través de nuestro correo electrónico soporte@tronoss.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsAndConditions;