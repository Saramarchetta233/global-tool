-- INSERIMENTO MANUALE UTENTE PER FIX IMMEDIATO
INSERT INTO public.users (id, email, credits) 
VALUES ('1d2bede1-c904-46f0-a912-389e46bfefdb', 'albertoinuso@gmail.com', 120)
ON CONFLICT (id) 
DO UPDATE SET credits = 120;