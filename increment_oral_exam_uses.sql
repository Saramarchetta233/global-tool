-- Funzione RPC per incrementare oral_exam_uses in modo atomico
CREATE OR REPLACE FUNCTION increment_oral_exam_uses(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    current_uses INTEGER;
    new_uses INTEGER;
BEGIN
    -- Leggi il valore corrente con FOR UPDATE per evitare race conditions
    SELECT COALESCE(oral_exam_uses, 0) INTO current_uses
    FROM profiles 
    WHERE user_id = p_user_id 
    FOR UPDATE;
    
    -- Calcola il nuovo valore
    new_uses := current_uses + 1;
    
    -- Aggiorna con il nuovo valore
    UPDATE profiles 
    SET oral_exam_uses = new_uses,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Verifica che l'update sia andato a buon fine
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found: %', p_user_id;
    END IF;
    
    -- Ritorna il risultato
    RETURN JSON_BUILD_OBJECT(
        'success', true,
        'user_id', p_user_id,
        'old_uses', current_uses,
        'new_uses', new_uses,
        'updated_at', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN JSON_BUILD_OBJECT(
            'success', false,
            'error', SQLERRM,
            'user_id', p_user_id
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione RPC per incrementare probable_questions_uses
CREATE OR REPLACE FUNCTION increment_probable_questions_uses(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    current_uses INTEGER;
    new_uses INTEGER;
BEGIN
    -- Leggi il valore corrente con FOR UPDATE per evitare race conditions
    SELECT COALESCE(probable_questions_uses, 0) INTO current_uses
    FROM profiles 
    WHERE user_id = p_user_id 
    FOR UPDATE;
    
    -- Calcola il nuovo valore
    new_uses := current_uses + 1;
    
    -- Aggiorna con il nuovo valore
    UPDATE profiles 
    SET probable_questions_uses = new_uses,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Verifica che l'update sia andato a buon fine
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found: %', p_user_id;
    END IF;
    
    -- Ritorna il risultato
    RETURN JSON_BUILD_OBJECT(
        'success', true,
        'user_id', p_user_id,
        'old_uses', current_uses,
        'new_uses', new_uses,
        'updated_at', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN JSON_BUILD_OBJECT(
            'success', false,
            'error', SQLERRM,
            'user_id', p_user_id
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;