# import sqlite3
# from pathlib import Path
# from datetime import datetime

# DB_PATH = Path(__file__).parent / "ocusense.db"


# def get_connection():
#     conn = sqlite3.connect(
#         DB_PATH,
#         timeout=10
#     )

#     conn.row_factory = sqlite3.Row

#     conn.execute("PRAGMA journal_mode=WAL")
#     conn.execute("PRAGMA busy_timeout=10000")

#     return conn


# def init_database():
#     conn = get_connection()

#     # -----------------------------------------
#     # Patients
#     # -----------------------------------------
#     conn.execute("""
#     CREATE TABLE IF NOT EXISTS patients (
#         patient_id TEXT PRIMARY KEY,
#         name TEXT,
#         age INTEGER,
#         gender TEXT,
#         diabetes_duration TEXT,
#         reference_id TEXT,
#         notes TEXT,
#         created_at TEXT DEFAULT CURRENT_TIMESTAMP
#     )
# """)

#         # -----------------------------------------
#     # Database migration
#     # -----------------------------------------
#         # -----------------------------------------
#     # Database migration
#     # -----------------------------------------
#     patient_columns = [
#         row[1]
#         for row in conn.execute(
#             "PRAGMA table_info(patients)"
#         ).fetchall()
#     ]

#     if "diabetes_duration" not in patient_columns:
#         conn.execute(
#             "ALTER TABLE patients ADD COLUMN diabetes_duration TEXT"
#         )

#     if "reference_id" not in patient_columns:
#         conn.execute(
#             "ALTER TABLE patients ADD COLUMN reference_id TEXT"
#         )

#     if "notes" not in patient_columns:
#         conn.execute(
#             "ALTER TABLE patients ADD COLUMN notes TEXT"
#         )

#     # -----------------------------------------
#     # Screenings
#     # -----------------------------------------
#     conn.execute("""
#         CREATE TABLE IF NOT EXISTS screenings (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             screening_id TEXT NOT NULL UNIQUE,
#             patient_id TEXT NOT NULL,
#             image_filename TEXT,
#             image_path TEXT,
#             image_quality TEXT,
#             blur_score REAL,
#             dr_grade INTEGER,
#             severity TEXT,
#             risk_level TEXT,
#             confidence REAL,
#             heatmap_filename TEXT,
#             overlay_filename TEXT,
#             created_at TEXT DEFAULT CURRENT_TIMESTAMP,

#             FOREIGN KEY (patient_id)
#                 REFERENCES patients(patient_id)
#         )
#     """)

#     # -----------------------------------------
#     # Referrals
#     # -----------------------------------------
#     conn.execute("""
#         CREATE TABLE IF NOT EXISTS referrals (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             patient_id TEXT NOT NULL,
#             screening_id TEXT,
#             dr_grade INTEGER NOT NULL,
#             risk_level TEXT NOT NULL,
#             referral_center TEXT,
#             referral_date TEXT,
#             appointment_date TEXT,
#             status TEXT NOT NULL DEFAULT 'REFERRED',
#             specialist_outcome TEXT,
#             follow_up_date TEXT,
#             created_at TEXT DEFAULT CURRENT_TIMESTAMP,
#             updated_at TEXT DEFAULT CURRENT_TIMESTAMP
#         )
#     """)

#     conn.commit()
#     conn.close()


# def generate_patient_id():
#     """
#     Generate patient ID in YYMMDDXXX format.

#     Example:
#     260526001 = first patient on 26 May 2026
#     260526002 = second patient on 26 May 2026
#     """

#     today = datetime.now()
#     date_prefix = today.strftime("%y%m%d")

#     conn = get_connection()

#     row = conn.execute(
#         """
#         SELECT MAX(
#             CAST(SUBSTR(patient_id, 7, 3) AS INTEGER)
#         )
#         FROM patients
#         WHERE patient_id LIKE ?
#         """,
#         (f"{date_prefix}%",)
#     ).fetchone()

#     conn.close()

#     last_number = row[0] if row and row[0] is not None else 0
#     next_number = last_number + 1

#     if next_number > 999:
#         raise ValueError(
#             "Daily patient limit of 999 has been reached."
#         )

#     return f"{date_prefix}{next_number:03d}"


# def create_patient(
#     name=None,
#     age=None,
#     gender=None,
#     diabetes_duration=None,
#     reference_id=None,
#     notes=None
# ):
#     """
#     Create a patient and return the generated patient ID.
#     """

#     patient_id = generate_patient_id()

#     conn = get_connection()

#     conn.execute(
#         """
#         INSERT INTO patients (
#             patient_id,
#             name,
#             age,
#             gender,
#             diabetes_duration,
#             reference_id,
#             notes
#         )
#         VALUES (?, ?, ?, ?, ?, ?, ?)
#         """,
#         (
#             patient_id,
#             name,
#             age,
#             gender,
#             diabetes_duration,
#             reference_id,
#             notes
#         )
#     )

#     conn.commit()
#     conn.close()

#     return patient_id


# def save_screening(
#     screening_id,
#     patient_id,
#     image_filename,
#     image_path,
#     image_quality,
#     blur_score,
#     dr_grade,
#     severity,
#     risk_level,
#     confidence,
#     heatmap_filename=None,
#     overlay_filename=None
# ):
#     """
#     Save a completed AI screening.
#     """

#     conn = get_connection()

#     conn.execute(
#         """
#         INSERT INTO screenings (
#             screening_id,
#             patient_id,
#             image_filename,
#             image_path,
#             image_quality,
#             blur_score,
#             dr_grade,
#             severity,
#             risk_level,
#             confidence,
#             heatmap_filename,
#             overlay_filename
#         )
#         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """,
#         (
#             screening_id,
#             patient_id,
#             image_filename,
#             image_path,
#             image_quality,
#             blur_score,
#             dr_grade,
#             severity,
#             risk_level,
#             confidence,
#             heatmap_filename,
#             overlay_filename
#         )
#     )

#     conn.commit()
#     conn.close()


# def create_referral(
#     patient_id,
#     screening_id,
#     dr_grade,
#     risk_level,
#     referral_center=None,
#     referral_date=None
# ):
#     """
#     Automatically create a referral.
#     """

#     conn = get_connection()

#     cursor = conn.execute(
#         """
#         INSERT INTO referrals (
#             patient_id,
#             screening_id,
#             dr_grade,
#             risk_level,
#             referral_center,
#             referral_date,
#             status
#         )
#         VALUES (?, ?, ?, ?, ?, ?, ?)
#         """,
#         (
#             patient_id,
#             screening_id,
#             dr_grade,
#             risk_level,
#             referral_center,
#             referral_date,
#             "REFERRED"
#         )
#     )

#     referral_id = cursor.lastrowid

#     conn.commit()
#     conn.close()
#     def get_screening(screening_id):

#     conn = get_connection()

#     row = conn.execute(
#         """
#         SELECT
#             screening_id,
#             patient_id,
#             image_filename,
#             image_path,
#             image_quality,
#             blur_score,
#             dr_grade,
#             severity,
#             risk_level,
#             confidence,
#             heatmap_filename,
#             overlay_filename,
#             created_at
#         FROM screenings
#         WHERE screening_id = ?
#         """,
#         (screening_id,)
#     ).fetchone()

#     conn.close()

#     return dict(row) if row else None
#     return referral_id


# if __name__ == "__main__":
#     init_database()

#     print("✅ OcuSense database initialized")

#     test_patient_id = generate_patient_id()
#     print("Next patient ID:", test_patient_id)
import sqlite3
from pathlib import Path
from datetime import datetime


DB_PATH = Path(__file__).parent / "ocusense.db"


# =========================================================
# Database connection
# =========================================================

def get_connection():
    conn = sqlite3.connect(
        DB_PATH,
        timeout=10
    )

    conn.row_factory = sqlite3.Row

    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=10000")

    return conn


# =========================================================
# Initialize database
# =========================================================

def init_database():
    conn = get_connection()

    # -----------------------------------------------------
    # Patients
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            patient_id TEXT PRIMARY KEY,
            name TEXT,
            age INTEGER,
            gender TEXT,
            diabetes_duration TEXT,
            reference_id TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # -----------------------------------------------------
    # Database migration
    # -----------------------------------------------------

    patient_columns = [
        row[1]
        for row in conn.execute(
            "PRAGMA table_info(patients)"
        ).fetchall()
    ]

    if "diabetes_duration" not in patient_columns:
        conn.execute(
            "ALTER TABLE patients ADD COLUMN diabetes_duration TEXT"
        )

    if "reference_id" not in patient_columns:
        conn.execute(
            "ALTER TABLE patients ADD COLUMN reference_id TEXT"
        )

    if "notes" not in patient_columns:
        conn.execute(
            "ALTER TABLE patients ADD COLUMN notes TEXT"
        )

    # -----------------------------------------------------
    # Screenings
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS screenings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            screening_id TEXT NOT NULL UNIQUE,
            patient_id TEXT NOT NULL,
            image_filename TEXT,
            image_path TEXT,
            image_quality TEXT,
            blur_score REAL,
            dr_grade INTEGER,
            severity TEXT,
            risk_level TEXT,
            confidence REAL,
            heatmap_filename TEXT,
            overlay_filename TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (patient_id)
                REFERENCES patients(patient_id)
        )
    """)

    # -----------------------------------------------------
    # Referrals
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS referrals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            screening_id TEXT,
            dr_grade INTEGER NOT NULL,
            risk_level TEXT NOT NULL,
            referral_center TEXT,
            referral_date TEXT,
            appointment_date TEXT,
            status TEXT NOT NULL DEFAULT 'REFERRED',
            specialist_outcome TEXT,
            follow_up_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


# =========================================================
# Generate patient ID
# =========================================================

def generate_patient_id():
    """
    Generate patient ID in YYMMDDXXX format.

    Example:
    260526001 = first patient on 26 May 2026
    260526002 = second patient on 26 May 2026
    """

    today = datetime.now()
    date_prefix = today.strftime("%y%m%d")

    conn = get_connection()

    row = conn.execute(
        """
        SELECT MAX(
            CAST(SUBSTR(patient_id, 7, 3) AS INTEGER)
        )
        FROM patients
        WHERE patient_id LIKE ?
        """,
        (f"{date_prefix}%",)
    ).fetchone()

    conn.close()

    last_number = (
        row[0]
        if row and row[0] is not None
        else 0
    )

    next_number = last_number + 1

    if next_number > 999:
        raise ValueError(
            "Daily patient limit of 999 has been reached."
        )

    return f"{date_prefix}{next_number:03d}"


# =========================================================
# Create patient
# =========================================================

def create_patient(
    name=None,
    age=None,
    gender=None,
    diabetes_duration=None,
    reference_id=None,
    notes=None
):
    """
    Create a patient and return the generated patient ID.
    """

    patient_id = generate_patient_id()

    conn = get_connection()

    conn.execute(
        """
        INSERT INTO patients (
            patient_id,
            name,
            age,
            gender,
            diabetes_duration,
            reference_id,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            patient_id,
            name,
            age,
            gender,
            diabetes_duration,
            reference_id,
            notes
        )
    )

    conn.commit()
    conn.close()

    return patient_id


# =========================================================
# Save completed screening
# =========================================================

def save_screening(
    screening_id,
    patient_id,
    image_filename,
    image_path,
    image_quality,
    blur_score,
    dr_grade,
    severity,
    risk_level,
    confidence,
    heatmap_filename=None,
    overlay_filename=None
):
    """
    Save a completed AI screening.
    """

    conn = get_connection()

    conn.execute(
        """
        INSERT INTO screenings (
            screening_id,
            patient_id,
            image_filename,
            image_path,
            image_quality,
            blur_score,
            dr_grade,
            severity,
            risk_level,
            confidence,
            heatmap_filename,
            overlay_filename
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            screening_id,
            patient_id,
            image_filename,
            image_path,
            image_quality,
            blur_score,
            dr_grade,
            severity,
            risk_level,
            confidence,
            heatmap_filename,
            overlay_filename
        )
    )

    conn.commit()
    conn.close()


# =========================================================
# Get saved screening
# =========================================================

def get_screening(screening_id):
    """
    Retrieve a saved screening from the database.
    """

    conn = get_connection()

    row = conn.execute(
        """
        SELECT
            screening_id,
            patient_id,
            image_filename,
            image_path,
            image_quality,
            blur_score,
            dr_grade,
            severity,
            risk_level,
            confidence,
            heatmap_filename,
            overlay_filename,
            created_at
        FROM screenings
        WHERE screening_id = ?
        """,
        (screening_id,)
    ).fetchone()

    conn.close()

    return dict(row) if row else None


# =========================================================
# Create referral
# =========================================================

def create_referral(
    patient_id,
    screening_id,
    dr_grade,
    risk_level,
    referral_center=None,
    referral_date=None,
    appointment_date=None,
    follow_up_date=None
):
    """
    Automatically create a referral.
    """

    conn = get_connection()

    cursor = conn.execute(
        """
        INSERT INTO referrals (
            patient_id,
            screening_id,
            dr_grade,
            risk_level,
            referral_center,
            referral_date,
            appointment_date,
            status,
            specialist_outcome,
            follow_up_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            patient_id,
            screening_id,
            dr_grade,
            risk_level,
            referral_center,
            referral_date,
            appointment_date,
            "REFERRED",
            None,
            follow_up_date
        )
    )

    referral_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return referral_id


# =========================================================
# Run database initialization directly
# =========================================================

if __name__ == "__main__":
    init_database()

    print("✅ OcuSense database initialized")

    test_patient_id = generate_patient_id()

    print(
        "Next patient ID:",
        test_patient_id
    )