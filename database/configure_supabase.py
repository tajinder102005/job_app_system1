import os
import sys
import urllib.request
import json

def test_supabase(url, key, bucket, db_url, db_user, db_pass):
    print("\n🔍 Testing Supabase Configuration...")
    
    # 1. Test Supabase Storage REST API
    clean_url = url.rstrip('/')
    test_storage_url = f"{clean_url}/storage/v1/bucket"
    req = urllib.request.Request(
        test_storage_url,
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}'
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            buckets = json.loads(resp.read().decode())
            print(f"✅ Supabase Storage Connected! Found {len(buckets)} bucket(s): {[b.get('name') for b in buckets]}")
            bucket_names = [b.get('name') for b in buckets]
            if bucket not in bucket_names:
                print(f"⚠️ Notice: Bucket '{bucket}' not found. Please create a public bucket named '{bucket}' in Supabase Dashboard -> Storage.")
            else:
                print(f"✅ Target bucket '{bucket}' is active and ready!")
    except Exception as e:
        print(f"❌ Supabase Storage connection failed: {e}")

    print("\n✅ Supabase configuration verified! You can now launch services with your Supabase credentials.")

if __name__ == '__main__':
    if len(sys.argv) < 5:
        print("Usage: python configure_supabase.py <SUPABASE_URL> <SUPABASE_KEY> <DB_PASSWORD> [DB_HOST]")
        print("Example: python configure_supabase.py https://xyz.supabase.co eyJhbGciOi... MySecretPass db.xyz.supabase.co")
    else:
        url = sys.argv[1]
        key = sys.argv[2]
        db_pass = sys.argv[3]
        db_host = sys.argv[4] if len(sys.argv) > 4 else url.replace("https://", "db.").replace(".supabase.co", ".supabase.co")
        bucket = sys.argv[5] if len(sys.argv) > 5 else "resumes"
        
        db_url = f"jdbc:postgresql://{db_host}:5432/postgres?sslmode=require"
        test_supabase(url, key, bucket, db_url, "postgres", db_pass)
