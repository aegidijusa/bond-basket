# Įrašų lentelė naujame puslapyje

Naujas puslapis su lentele, kurioje matomi ir tvarkomi įrašai su jūsų nurodytais laukais.

## Ką gausite

- Naujas puslapis (adresas `/irasai`), į kurį galima patekti iš pradinio puslapio.
- Lentelė su stulpeliais: data, gavimo data, PSP, tipas, tyrėjas, padalinys, postas, pareigūnas, pažymėjimas, siuntos nr., ikiteisminio nr., ikiteisminis pradėtas, pastabos, byla baigta, bylos baigimo data.
- Mygtukas „Naujas įrašas“ su forma (datos pasirenkamos kalendoriuje, „byla baigta“ – žymimasis langelis).
- Įrašo redagavimas ir ištrynimas.
- Paieška pagal siuntos nr. / ikiteisminio nr. / pareigūną ir filtras „byla baigta / nebaigta“.
- Prisijungimo puslapis (el. paštas + slaptažodis ir Google). Įrašus mato ir tvarko tik prisijungę naudotojai, nes duomenys yra tarnybiniai.

## Duomenų saugojimas

Sukuriama lentelė `protokolai` su laukais:
`data`, `gavimo_data`, `psp`, `tipas`, `tyrejas`, `padalinys`, `postas`, `pareigunas`, `pazymejimas`, `siuntos_nr`, `ikiteism_nr`, `ikiteisminis_prad`, `pastabos`, `byla_baigta`, `bylos_baigimo_data`, plius `id`, `created_by`, `created_at`, `updated_at`.

Datos laukai – datos tipo, `byla_baigta` – taip/ne (numatytai „ne“), `pastabos` – ilgas tekstas, likę – tekstas.

## Prieigos taisyklės

- Įrašus skaityti, kurti, redaguoti ir šalinti gali tik prisijungę naudotojai.
- Neprisijungusiems duomenys neprieinami.
- Kiekvienas įrašas išsaugo, kuris naudotojas jį sukūrė.

## Techninės detalės

- Migracija: `public.protokolai` + GRANT `authenticated`/`service_role`, RLS įjungta, politikos `auth.uid()` pagrindu; `updated_at` trigeris.
- Puslapis po `src/routes/_authenticated/irasai.tsx`; duomenys per `createServerFn` su `requireSupabaseAuth`, `attachSupabaseAuth` užregistruotas `src/start.ts`.
- Autentifikacija: viešas `/auth` puslapis, Google provider sukonfigūruojamas tą patį kartą.
- Lentelė ir forma iš shadcn komponentų, semantiniai spalvų tokenai `src/styles.css`.
- SEO: `head()` su unikaliu pavadinimu ir aprašymu; pradinis puslapis pertvarkomas į trumpą pradžios ekraną su nuoroda į įrašus.
