<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Client;

/**
 * Importa los clientes exportados de Keyfacil.
 * Idempotente: usa firstOrCreate por document_number.
 * Nota: el HTML estaba truncado, agrega más entradas si lo necesitas.
 */
class KeyfacilClientsSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            // ── A ──────────────────────────────────────────────────────────
            ['name' => 'A&G LA ESPERANZA S.A.C.',                    'document_type' => 'RUC', 'document_number' => '20514385662'],
            ['name' => 'A&M PROVEEDORES PERU S.A.C.',                'document_type' => 'RUC', 'document_number' => '20538735532'],
            ['name' => 'ABANTO MEDINA JOHAN GEREMI',                  'document_type' => 'DNI', 'document_number' => '10341359'],
            ['name' => 'AGAMA ESTEBAN YENY ALEJANDRA',               'document_type' => 'RUC', 'document_number' => '10778226729'],
            ['name' => 'AGUILAR CULQUI MARIA ESTHER',                'document_type' => 'RUC', 'document_number' => '10093938408'],
            ['name' => 'ALAMESA SERVICE SRL',                         'document_type' => 'RUC', 'document_number' => '20476629153'],
            ['name' => 'ALBUJAR GODOY NATALIE STEFANIA',             'document_type' => 'RUC', 'document_number' => '10477857154'],
            ['name' => 'ALCARRAZ NAJARRO DAYSI',                     'document_type' => 'RUC', 'document_number' => '10420218562'],
            ['name' => 'ALIDAM PERU S.A.C.',                         'document_type' => 'RUC', 'document_number' => '20604496854'],
            ['name' => 'ALMA FOODS S.A.C.',                          'document_type' => 'RUC', 'document_number' => '20605169563'],
            ['name' => 'ALMACENES SILVER SAC',                       'document_type' => 'RUC', 'document_number' => '20607549797'],
            ['name' => 'AQUILES GYM S.A.C.',                         'document_type' => 'RUC', 'document_number' => '20608181751'],
            ['name' => 'ARANGO ZAMATA PATRICIA ROCIO',               'document_type' => 'RUC', 'document_number' => '10107984581'],
            ['name' => 'ARAQUE CAMPOS JOSE GREGORIO',                'document_type' => 'RUC', 'document_number' => '15609617711'],
            ['name' => 'ARDILES ORTEGA CINTHIA',                     'document_type' => 'RUC', 'document_number' => '10726105290'],
            ['name' => 'ARKANO TRADING SOCIEDAD ANONIMA CERRADA - ARKANO TRADING S.A.C.', 'document_type' => 'RUC', 'document_number' => '20605400231'],
            ['name' => 'ASOCIACION SACO OLIVEROS',                   'document_type' => 'RUC', 'document_number' => '20284670796'],

            // ── B ──────────────────────────────────────────────────────────
            ['name' => 'BARDALEZ SANDOVAL KATTY',                    'document_type' => 'RUC', 'document_number' => '10438263611'],
            ['name' => 'BASEL PERU S.A.',                            'document_type' => 'RUC', 'document_number' => '20167893482'],
            ['name' => 'BERMUDEZ MONCADA E.I.R.L',                  'document_type' => 'RUC', 'document_number' => '20608171305'],
            ['name' => 'BIERHAUS',                                   'document_type' => 'RUC', 'document_number' => '20600173724'],
            ['name' => 'BIKOFFE S.A.C.',                             'document_type' => 'RUC', 'document_number' => '20607787663'],
            ['name' => 'BIOCAFETA HEALTHY FOOD S.A.C.',              'document_type' => 'RUC', 'document_number' => '20603378581'],
            ['name' => 'BLUEFAIRY INVESTMENTS S.A.C.',               'document_type' => 'RUC', 'document_number' => '20551569722'],
            ['name' => 'BOURBON CAFE E.I.R.L.',                      'document_type' => 'RUC', 'document_number' => '20609154561'],
            ['name' => 'BUTRICH S.A.C.',                             'document_type' => 'RUC', 'document_number' => '20548677867'],

            // ── C ──────────────────────────────────────────────────────────
            ['name' => 'C.E.PARROQUIAL VIRGEN DEL ROSARIO',          'document_type' => 'RUC', 'document_number' => '20122444521'],
            ['name' => 'CACERES DE BENAVENTE ANA MARIA',             'document_type' => 'RUC', 'document_number' => '10103379712'],
            ['name' => 'CAFE - RESTAURANT ALOCASIA S.A.C.',          'document_type' => 'RUC', 'document_number' => '20603811497'],
            ['name' => 'CALDERON NIEVES LUZ DOLORES',                'document_type' => 'RUC', 'document_number' => '10097316851'],
            ['name' => 'CAMERINO CAFFE PERU S.A.C.',                 'document_type' => 'RUC', 'document_number' => '20603270577'],
            ['name' => 'CASA FANNING APARTMENTS SOCIEDAD ANONIMA CERRADA', 'document_type' => 'RUC', 'document_number' => '20524362229'],
            ['name' => 'CASA VASQUEZ S.A.',                          'document_type' => 'RUC', 'document_number' => '20605986430'],
            ['name' => 'CENTRO DE EVENTOS ZIPANGO S.R.L.',           'document_type' => 'RUC', 'document_number' => '20611772298'],
            ['name' => 'CENTRO RESIDENCIAL GERIATRICO LAS MAGNOLIAS S.A.C.', 'document_type' => 'RUC', 'document_number' => '20605322477'],
            ['name' => 'CHASQUI PRODUCCIONES S.A.C.',                'document_type' => 'RUC', 'document_number' => '20551698611'],
            ['name' => 'CHAVEZ CORPORATION SOCIEDAD COMERCIAL DE RESPONSABILIDAD LIMITADA - CHAVEZ CORPORATION S.R.L.', 'document_type' => 'RUC', 'document_number' => '20512382496'],
            ['name' => 'CHAVEZ TORRECHAYOC S.R.L.',                  'document_type' => 'RUC', 'document_number' => '20611257890'],
            ['name' => 'CHEF TONG S.A.C.',                           'document_type' => 'RUC', 'document_number' => '20602895166'],
            ['name' => 'CHEN XINMO',                                  'document_type' => 'RUC', 'document_number' => '15504459508'],
            ['name' => 'CHOCOLATE Y COCOA S.A.C.',                   'document_type' => 'RUC', 'document_number' => '20600386876'],
            ['name' => 'CHRISTOPHERSON QUINTEROS CLARA CLEMENCIA',   'document_type' => 'RUC', 'document_number' => '10438680271'],
            ['name' => 'CHUCOS BERROCAL LUZ VICTORIA',               'document_type' => 'RUC', 'document_number' => '10426609881'],
            ['name' => 'CIUFFARDI RODRIGO TAMARA ALEXA',             'document_type' => 'RUC', 'document_number' => '10485604222'],
            ['name' => 'CLINICA NIZAMA S.A.C.',                      'document_type' => 'RUC', 'document_number' => '20535955965'],
            ['name' => 'CLUB DE REGATAS LIMA',                       'document_type' => 'RUC', 'document_number' => '20136907400'],
            ['name' => 'COCHRANE S.A.C.',                            'document_type' => 'RUC', 'document_number' => '20608197011'],
            ['name' => 'COESTI S.A.',                                 'document_type' => 'RUC', 'document_number' => '20127765279'],
            ['name' => 'COLEGIO SAN ANTONIO IHM',                    'document_type' => 'RUC', 'document_number' => '20140752593'],
            ['name' => 'COMERCIAL CUEVA INVERSIONES EN GENERAL.S.A.','document_type' => 'RUC', 'document_number' => '20302909505'],
            ['name' => 'COMIDA CHINA PERUANA S.A.C.',                'document_type' => 'RUC', 'document_number' => '20607626660'],
            ['name' => 'COMPAÑIA BLACK TRACK S.A.C.- BLACK TRACK S.A.C.', 'document_type' => 'RUC', 'document_number' => '20543659691'],
            ['name' => 'COMPANY GOODS AND SERVICES G.P. S.A.C.',     'document_type' => 'RUC', 'document_number' => '20565485483'],
            ['name' => 'CONGREG. PADRES OBLATOS SAN JOSE DE ASTI',   'document_type' => 'RUC', 'document_number' => '20147736577'],
            ['name' => 'CONSORCIO SUPERVISOR DE LIMA',               'document_type' => 'RUC', 'document_number' => '20611335637'],
            ['name' => 'CONSTRUCTORA INMOBILIARIA MULTIDEPAS S.A.C.','document_type' => 'RUC', 'document_number' => '20550370353'],
            ['name' => 'CONSULTORIA Y EJECUCION DE COBRANZA ESPECIAL E.I.R.L. - CECOE E.I.R.L.', 'document_type' => 'RUC', 'document_number' => '20603706189'],
            ['name' => 'CONSULTORIO PSICOLOGICO MGA S.A.C.',         'document_type' => 'RUC', 'document_number' => '20610175822'],
            ['name' => 'COOKING MAS S.A.C.',                         'document_type' => 'RUC', 'document_number' => '20612975494'],
            ['name' => 'CORPORACION CARL CORQUIN\'S E.I.R.L.',       'document_type' => 'RUC', 'document_number' => '20606171774'],
            ['name' => 'CORPORACION SANCHEZ SPIGNO SAC',             'document_type' => 'RUC', 'document_number' => '20611971312'],
            ['name' => 'COSTUMBRES ARGENTINAS SOCIEDAD ANONIMA CERRADA-COSTUMBRES ARGENTINAS S.A.C.', 'document_type' => 'RUC', 'document_number' => '20492953246'],
            ['name' => 'CRISANTO SULLON SANTOS',                     'document_type' => 'DNI', 'document_number' => '03880267'],

            // ── D ──────────────────────────────────────────────────────────
            ['name' => 'DECO STORE EMPRESA INDIVIDUAL DE RESPONSABILIDAD LIMITADA-DECO STORE E.I.R.L.', 'document_type' => 'RUC', 'document_number' => '20512224238'],
            ['name' => 'DELGADO LUQUE CESAR EMILIO',                 'document_type' => 'RUC', 'document_number' => '10412975273'],
            ['name' => 'DELGADO SOLIS LUIS HONORIO',                 'document_type' => 'DNI', 'document_number' => '06621612'],
            ['name' => 'DERIVADOS DE HARINA Y BODEGA S C R L',       'document_type' => 'RUC', 'document_number' => '20102034814'],
            ['name' => 'DIRIS LIMA SUR',                             'document_type' => 'DNI', 'document_number' => '70751891'],
            ['name' => 'DOMINGUEZ BORJAS EVELYN CRISTHINA',          'document_type' => 'DNI', 'document_number' => '43747430'],
            ['name' => 'DORICH & WATKIN S.A.C',                      'document_type' => 'RUC', 'document_number' => '20100331528'],
            ['name' => 'DURAND VELARDE JUSTO GERMAN',                'document_type' => 'RUC', 'document_number' => '10084680783'],

            // ── E ──────────────────────────────────────────────────────────
            ['name' => 'E. GOURMET S.A.C.',                          'document_type' => 'RUC', 'document_number' => '20607522864'],
            ['name' => 'EDUREYGE S.A.C.',                            'document_type' => 'RUC', 'document_number' => '20603590407'],
            ['name' => 'ELERA RUIZ MARIA YVETTE',                    'document_type' => 'DNI', 'document_number' => '43452261'],
            ['name' => 'EMBAJADA DE LA REPUBLICA FEDERATIVA DEL BRASIL', 'document_type' => 'RUC', 'document_number' => '20508031395'],
            ['name' => 'EMPRESA DE TRANSP.Y SERV.EL PORVENIR S.A',  'document_type' => 'RUC', 'document_number' => '20138406289'],
            ['name' => 'ESPECIALIDADES ODONTOLOGICAS ROJAS ESCUDERO SOCIEDAD ANONIMA CERRADA', 'document_type' => 'RUC', 'document_number' => '20516782570'],
            ['name' => 'EVENTOS PROFESIONALES S.A.C.',               'document_type' => 'RUC', 'document_number' => '20515326945'],

            // ── F ──────────────────────────────────────────────────────────
            ['name' => 'FERNANDEZ RIOS ALEXANDRA',                   'document_type' => 'RUC', 'document_number' => '10779220261'],
            ['name' => 'FERYMAR S.A.C',                              'document_type' => 'RUC', 'document_number' => '20505070179'],
            ['name' => 'FLAMINGO GAMES S.A.C.',                      'document_type' => 'RUC', 'document_number' => '20302871427'],
            ['name' => 'FLOTTWEG PERU S.A.C.',                       'document_type' => 'RUC', 'document_number' => '20600322223'],
            ['name' => 'FORASTERO CAFE E.I.R.L.',                    'document_type' => 'RUC', 'document_number' => '20607525138'],
            ['name' => 'FRAPIO S.A.C.',                              'document_type' => 'RUC', 'document_number' => '20600662997'],
            ['name' => 'FU XUAN SOCIEDAD ANONIMA CERRADA - FU XUAN S.A.C.', 'document_type' => 'RUC', 'document_number' => '20550914043'],
            ['name' => 'FUERZA AEREA DEL PERU',                      'document_type' => 'RUC', 'document_number' => '20144364059'],
            ['name' => 'FULL STOCK S.R.L',                           'document_type' => 'RUC', 'document_number' => '20523515960'],

            // ── G ──────────────────────────────────────────────────────────
            ['name' => 'GALARZA COLQUEHUANCA IRVING HUGO',           'document_type' => 'RUC', 'document_number' => '10703152282'],
            ['name' => 'GASCO CAMPBELL DE ANGULO CARMEN JULIA',      'document_type' => 'RUC', 'document_number' => '10087486546'],
            ['name' => 'GASTRONOMIA VEGANA LIMA S.A.C.',             'document_type' => 'RUC', 'document_number' => '20610407057'],
            ['name' => 'GESTION NUTRICIONAL SOCIEDAD ANONIMA CERRADA','document_type' => 'RUC', 'document_number' => '20553710597'],
            ['name' => 'GIUFFRA VASQUEZ PAULO',                      'document_type' => 'RUC', 'document_number' => '10445014252'],
            ['name' => 'GOMEZ GUIULFO MARIA CECILIA',                'document_type' => 'RUC', 'document_number' => '10093780529'],
            ['name' => 'GRANIZHADA GROUP S.A.C.',                    'document_type' => 'RUC', 'document_number' => '20601184886'],
            ['name' => 'GRUPO NUÑAY NORFE EIRL',                     'document_type' => 'RUC', 'document_number' => '20609298031'],
            ['name' => 'GRUPO RN SOCIEDAD ANONIMA CERRADA-GRUPO RN S.A.C.', 'document_type' => 'RUC', 'document_number' => '20479084425'],
            ['name' => 'GUTIERREZ VALENZUELA EDER',                  'document_type' => 'RUC', 'document_number' => '10438259134'],

            // ── H ──────────────────────────────────────────────────────────
            ['name' => 'HECHOENCASA S.A.C',                          'document_type' => 'RUC', 'document_number' => '20546941214'],
            ['name' => 'HERGUZ PERU S.A.C.',                         'document_type' => 'RUC', 'document_number' => '20600226291'],
            ['name' => 'HIRANO TAMAGUCHI DIANA',                     'document_type' => 'RUC', 'document_number' => '10159402491'],
            ['name' => 'HUAPAYA INGA JAIME ANDRES',                  'document_type' => 'DNI', 'document_number' => '09381076'],
            ['name' => 'HUTARRA CLARK JORGE SALOMON',                'document_type' => 'RUC', 'document_number' => '10407501867'],

            // ── I ──────────────────────────────────────────────────────────
            ['name' => 'I.E.I.P. MY LITTLE HEAVEN EIRL',             'document_type' => 'RUC', 'document_number' => '20492130347'],
            ['name' => 'IMPERIO MONTALBAN E.I.R.L.',                 'document_type' => 'RUC', 'document_number' => '20609142155'],
            ['name' => 'IMPORTACIONES SUDAMERICA S.A.C.',            'document_type' => 'RUC', 'document_number' => '20548707529'],
            ['name' => 'INDUSTRIAS FLEXIBLES SOCIEDAD ANONIMA CERRADA-INDUFLEX SAC', 'document_type' => 'RUC', 'document_number' => '20509781509'],
            ['name' => 'INSECTICIDAS Y RODENTICIDAS DEL PERU S.A.C.','document_type' => 'RUC', 'document_number' => '20507028471'],
            ['name' => 'INSTITUCION EDUCATIVA 6052 JOSE MARIA EGUREN','document_type' => 'RUC', 'document_number' => '20602514642'],
            ['name' => 'INSTITUCION EDUCATIVA DEL EJERCITO "CRL JOSE JOAQUIN INCLAN"', 'document_type' => 'RUC', 'document_number' => '20518245717'],
            ['name' => 'INSTITUCION EDUCATIVA DEL EJERCITO "LA ESPERANZA"', 'document_type' => 'RUC', 'document_number' => '20518210336'],
            ['name' => 'INTERDOMUS S.A.C.',                          'document_type' => 'RUC', 'document_number' => '20500394049'],
            ['name' => 'INVERSIONES ALI Y LEO S.A.C.',               'document_type' => 'RUC', 'document_number' => '20556409049'],
            ['name' => 'INVERSIONES DELPOP S.A.C.',                  'document_type' => 'RUC', 'document_number' => '20608948814'],
            ['name' => 'INVERSIONES GIAN POOL & MATHIAS S.A.C.',     'document_type' => 'RUC', 'document_number' => '20611053178'],
            ['name' => 'INVERSIONES LUNIVAL S.A.C.',                 'document_type' => 'RUC', 'document_number' => '20546309992'],
            ['name' => 'INVERSIONES PERIAN E.I.R.L.',                'document_type' => 'RUC', 'document_number' => '20608164163'],
            ['name' => 'INVERSIONES Q-LINARIAS S.A.C.',              'document_type' => 'RUC', 'document_number' => '20551286429'],
            ['name' => 'INVERSIONES ROSALBA S.A.C.',                 'document_type' => 'RUC', 'document_number' => '20609747651'],
            ['name' => 'INVERSIONES Y REPRESENTACIONES MILENIUM SOCIEDAD ANONIMA - IRMISA', 'document_type' => 'RUC', 'document_number' => '20429399603'],

            // ── J ──────────────────────────────────────────────────────────
            ['name' => 'JACARANDA ARTE EDUCACION Y CRIANZA S.A.C.',  'document_type' => 'RUC', 'document_number' => '20606656093'],
            ['name' => 'JC HIGIENE E.I.R.L.',                        'document_type' => 'RUC', 'document_number' => '20605297693'],
            ['name' => 'JESMIL INVERSIONES S.A.C.',                  'document_type' => 'RUC', 'document_number' => '20610090932'],
            ['name' => 'JHALEA PERU S.A.C.',                         'document_type' => 'RUC', 'document_number' => '20609767341'],
            ['name' => 'JIMMY & FELA S.A.C.',                        'document_type' => 'RUC', 'document_number' => '20608186337'],
            ['name' => 'JIMMY & MAMA FELA E.I.R.L.',                 'document_type' => 'RUC', 'document_number' => '20601152879'],
            ['name' => 'JJ Y R CADENA DE ALIMENTOS S.A.C.',          'document_type' => 'RUC', 'document_number' => '20605826785'],

            // ── K ──────────────────────────────────────────────────────────
            ['name' => 'KAPITAL BUSINESS S.A.C',                     'document_type' => 'RUC', 'document_number' => '20544936817'],
            ['name' => 'KATMACOR S.A.C.',                            'document_type' => 'RUC', 'document_number' => '20555717327'],
            ['name' => 'KILLERS MOTOR E.I.R.L.',                     'document_type' => 'RUC', 'document_number' => '20604732833'],

            // ── L ──────────────────────────────────────────────────────────
            ['name' => 'LA CALANDRIA CASA DEL BUEN VIVIR S.A.C.',    'document_type' => 'RUC', 'document_number' => '20609971411'],
            ['name' => 'LA FABRICA PIZZERIA MOVIL S.A.C.',           'document_type' => 'RUC', 'document_number' => '20602672736'],
            ['name' => 'LA PANA E.I.R.L.',                           'document_type' => 'RUC', 'document_number' => '20600019628'],
            ['name' => 'LA SANGU W & G S.A.C.',                      'document_type' => 'RUC', 'document_number' => '20608460897'],
            ['name' => 'LAGOS SOTO MARISOL',                         'document_type' => 'RUC', 'document_number' => '10434696157'],
            ['name' => 'LAVANDERIA SAN ANTONIO DRY CLEANERS EIRL',   'document_type' => 'RUC', 'document_number' => '20469472231'],
            ['name' => 'LAVANDERIA WELAUNDRY S.A.C.',                'document_type' => 'RUC', 'document_number' => '20608736141'],
            ['name' => 'LEON GOMEZ ANGELA ROCIO',                    'document_type' => 'RUC', 'document_number' => '10453996595'],
            ['name' => 'LEYVA BAUTISTA ENRIQUE',                     'document_type' => 'RUC', 'document_number' => '10066474602'],
            ['name' => 'LIBRERIA PERUANO BRITANICA S.R.LTDA.',       'document_type' => 'RUC', 'document_number' => '20134923874'],
            ['name' => 'LIMA 277 E.I.R.L.',                          'document_type' => 'RUC', 'document_number' => '20609763915'],
            ['name' => 'LIMA MODERN S.A.C.',                         'document_type' => 'RUC', 'document_number' => '20545685095'],
            ['name' => 'LIVIA BEDOYA MARIA CRISTINA',                'document_type' => 'RUC', 'document_number' => '10061155428'],
            ['name' => 'LOLA & MIGUEL SAC',                          'document_type' => 'RUC', 'document_number' => '20521103192'],
            ['name' => 'LOPEZ OLIVERA NASMIT LUSHICH',               'document_type' => 'RUC', 'document_number' => '10417252814'],
            ['name' => 'LOPEZ RODRIGUEZ VIOLETA AMADA',              'document_type' => 'DNI', 'document_number' => '43898330'],
            ['name' => 'LUMINI INTERPRETACION DE MERCADOS SOCIEDAD ANONIMA CERRADA', 'document_type' => 'RUC', 'document_number' => '20516052334'],

            // ── M ──────────────────────────────────────────────────────────
            ['name' => 'MACHUCA TIRADO PELAYO',                      'document_type' => 'RUC', 'document_number' => '10066708522'],
            ['name' => 'MAMIBABIES',                                  'document_type' => 'CE',  'document_number' => '41407781'],
            ['name' => 'MANOS MAESTRAS LIMA PERU S.A.C.',            'document_type' => 'RUC', 'document_number' => '20543132501'],
            ['name' => 'MAPPU S.A.C.',                               'document_type' => 'RUC', 'document_number' => '20607295183'],
            ['name' => 'MARTINEZ RONCAL SANTOS ADELAIDA',            'document_type' => 'RUC', 'document_number' => '10475471623'],
            ['name' => 'MARYTA FOOD SERVICES S.A.C.',                'document_type' => 'RUC', 'document_number' => '20522241955'],
            ['name' => 'MEDIPERU SOCIEDAD ANONIMA - MEDIPERU S.A.',  'document_type' => 'RUC', 'document_number' => '20536058690'],
            ['name' => 'MGF DESIGN GROUP PERU S.R.L. - MGF',        'document_type' => 'RUC', 'document_number' => '20548092711'],
            ['name' => 'MORALES CAMA GROVER PAUL',                   'document_type' => 'RUC', 'document_number' => '10066724561'],
            ['name' => 'MORAN MORAN MIGUEL JOSE',                    'document_type' => 'RUC', 'document_number' => '10078039782'],
            ['name' => 'MOSCOSO CONTRERAS LINA BEATRIZ',             'document_type' => 'RUC', 'document_number' => '10077893895'],
            ['name' => 'MULTISERVICIOS MACHL S.A.C.',                'document_type' => 'RUC', 'document_number' => '20611443448'],

            // ── N ──────────────────────────────────────────────────────────
            ['name' => 'NATURLANDIA S.R.L.',                         'document_type' => 'RUC', 'document_number' => '20504529054'],
            ['name' => 'NESKA POLITA SOCIEDAD ANONIMA CERRADA',      'document_type' => 'RUC', 'document_number' => '20514792896'],
            ['name' => 'NOVENTAYOCHO PUBLICIDAD S.A.C.',             'document_type' => 'RUC', 'document_number' => '20605941568'],
            ['name' => 'NUÑEZ SOTO RIECKUF',                         'document_type' => 'RUC', 'document_number' => '10101882590'],
            ['name' => 'NUTHER E.I.R.L.',                            'document_type' => 'RUC', 'document_number' => '20603527811'],
            ['name' => 'NUTRI GOURMET E.I.R.L.',                     'document_type' => 'RUC', 'document_number' => '20563569752'],

            // ── O ──────────────────────────────────────────────────────────
            ['name' => 'OBRIEN PERRET LESLIE REBECA',                'document_type' => 'DNI', 'document_number' => '09867611'],
        ];

        $created = 0;
        $skipped = 0;

        foreach ($clients as $client) {
            $existing = Client::where('document_number', $client['document_number'])->first();
            if ($existing) {
                $skipped++;
                continue;
            }

            Client::create([
                'name'            => $client['name'],
                'document_type'   => $client['document_type'],
                'document_number' => $client['document_number'],
                'email'           => null,
                'phone'           => null,
                'address'         => null,
                'is_active'       => true,
            ]);
            $created++;
        }

        $this->command->info("Clientes Keyfacil: {$created} creados, {$skipped} ya existían.");
    }
}
